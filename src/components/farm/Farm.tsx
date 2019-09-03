import React, { useRef, useEffect, memo, useState, useCallback, useReducer } from "react";
import throttle from "lodash.throttle";
import cx from "classnames";
import styles from "./farm.module.scss";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { getObjects, getChickens, drawStaticObjects, drawDynamicObjects } from "../../utils/drawImages";
import foodUrl from "../../sprites/food1.png";
import { StaticObject } from "../../utils/staticObject";
import { loadImage } from "../../utils/loadImages";
import { Chicken } from "../../utils/chicken";
import { ChickenBreed } from "../../types/types";
import { farmReducer, initialFarmState } from "./reducer";
import {
  setObjectsAction,
  setChickensAction,
  toggleFeedingAction,
  toggleDraggingAction,
  addFoodAction,
  removeFoodAction,
} from "./actions";
import { setStorageKey, StorageKeys } from "../../utils/localStorage";

const RESIZE_BY = 2;

interface AddFoodItemOptions {
  foodImg: HTMLImageElement;
  addFood: (food: StaticObject) => void;
  x: number;
  y: number;
}

const addFoodItem = throttle((
  { foodImg, x, y, addFood }: AddFoodItemOptions,
  cb: (food: StaticObject) => void
) => {
  const food = new StaticObject({
    img: foodImg,
    top: Math.round(y / RESIZE_BY),
    left: Math.round(x / RESIZE_BY),
  });

  addFood(food);
  cb(food);
}, 100, { leading: true, trailing: false });

const getClosestChickenToEat = (
  food: StaticObject,
  chickens: Chicken[],
  removeFood: (id: number) => void,
) => {
  let closest = Infinity;
  let closestChicken: Chicken | undefined;

  chickens.forEach((chicken) => {
    if (chicken.hasFood()) {
      return;
    }

    const distance = Math.sqrt(
      Math.abs(chicken.left - food.left) ** 2
      + Math.abs(chicken.top - food.top) ** 2
    );

    if (distance < closest) {
      closest = distance
      closestChicken = chicken;
    }
  });

  if (closestChicken) {
    closestChicken.setFood(food, removeFood);
  }
};

const saveChickensToStorage = (chickens: Chicken[]) => {
  if(!chickens.length) {
    return;
  }
  const total: Record<ChickenBreed, number> = {
    brown: 0,
    orange: 0,
    yellow: 0,
  }
  chickens.forEach(chicken => total[chicken.getBreed()]++);
  setStorageKey(StorageKeys.chickens, total);
}

export const Farm: React.FC = memo(() => {
  const canvasStaticRef = useRef<HTMLCanvasElement>(null);
  const canvasDynRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef(0);
  const { resizedWidth, resizedHeight } = useWindowDimensions(RESIZE_BY);
  const [
    {
      isDragging,
      isFeeding,
      objects,
      chickens,
      food,
    },
    dispatch,
  ] = useReducer(farmReducer, initialFarmState);
  const [foodImg, setFoodImg] = useState<HTMLImageElement | undefined>(undefined);

  useEffect(() => {
    const stopFeedingOnEsc = (e: KeyboardEvent) => {
      if (e.code === "Escape" && isFeeding) {
        dispatch(toggleFeedingAction());
      }
    };
    document.addEventListener("keydown", stopFeedingOnEsc);

    return () => {
      document.removeEventListener("keydown", stopFeedingOnEsc);
    };
  }, [isFeeding]);

  useEffect(() => {
    Promise.all([
      getObjects(),
      getChickens(resizedWidth, resizedHeight),
      loadImage(foodUrl),
    ]).then(([objects, chickens, foodImg]) => {
      dispatch(setObjectsAction(objects));
      dispatch(setChickensAction(chickens));
      setFoodImg(foodImg);
    });
  }, [resizedWidth, resizedHeight]);

  useEffect(() => {
    saveChickensToStorage(chickens);
    return () => { saveChickensToStorage(chickens) };
  }, [chickens])

  useEffect(() => {
    drawStaticObjects({
      canvasStaticRef,
      resizedWidth,
      resizedHeight,
      objects,
      food,
    })
  }, [canvasStaticRef, resizedWidth, resizedHeight, objects, food]);

  useEffect(() => {
    drawDynamicObjects({
      canvasDynRef,
      resizedWidth,
      resizedHeight,
      animationIdRef,
      chickens,
    })
  }, [canvasDynRef, resizedWidth, resizedHeight, chickens]);

  const toggleFeeding = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(toggleFeedingAction());
  }

  const handleFoodAdd = useCallback((e) => {
    e.persist();
    if (!isFeeding || !foodImg || !isDragging) {
      return;
    }

    const options = {
      x: e.clientX,
      y: e.clientY,
      foodImg,
      addFood: (food: StaticObject) => dispatch(addFoodAction(food)),
    };
    const cb = (food: StaticObject) => {
      const removeFood = (id: number) => dispatch(removeFoodAction(id))
      getClosestChickenToEat(food, chickens, removeFood);
    };

    addFoodItem(options, cb);
  }, [isFeeding, foodImg, isDragging, chickens]);

  return (
    <div className={cx(styles.wrapper, isFeeding && styles.feeding)}>
      <div className={styles.bg}/>
      <canvas
        ref={canvasStaticRef}
        width={resizedWidth}
        height={resizedHeight}
        className={styles.canvas}
      ></canvas>
      <canvas
        ref={canvasDynRef}
        width={resizedWidth}
        height={resizedHeight}
        className={styles.canvas}
        onMouseDown={() => dispatch(toggleDraggingAction())}
        onMouseUp={(e) => {
          handleFoodAdd(e);
          dispatch(toggleDraggingAction())
        }}
        onMouseMove={handleFoodAdd}
      ></canvas>
      <div className={styles.toolBar}>
        <button className={styles.farmButton} onClick={toggleFeeding}>
          <img src={foodUrl} alt="food"></img>
        </button>
      </div>
    </div>
  );
});
