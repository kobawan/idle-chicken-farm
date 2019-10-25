import React, { useEffect, memo, useState, useCallback, useReducer } from "react";
import throttle from "lodash.throttle";
import cx from "classnames";
import styles from "./farm.module.scss";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { getChickens } from "../../utils/drawChickens";
import { createObjects } from "../../utils/drawObjects";
import { getFoodImgs, getFood } from "../../utils/drawFood";
import { Chicken } from "../../models/chicken";
import { Coordinates, InteractEvent } from "../../types/types";
import { farmReducer, initialFarmState } from "./reducer";
import {
  setObjectsAction,
  setChickensAction,
  toggleFeedingAction,
  toggleDraggingAction,
  addFoodAction,
  removeFoodAction,
  setFoodAction,
} from "./actions";
import { setStorageKey, StorageKeys } from "../../utils/localStorage";
import { Food, FoodProps } from "../../models/food";
import { StaticCanvas } from "../StaticCanvas/StaticCanvas";
import { Menu } from "../menu/Menu";
import { DynamicCanvas } from "../dynamicCanvas/DynamicCanvas";
import { getClosest, getDistance } from "../../utils/distance";
import { StaticObject } from "../../models/staticObject";
import { FoodCanvas } from "../foodCanvas/FoodCanvas";

const RESIZE_BY = 2;
const MAX_FOOD_DISTANCE = 300 / RESIZE_BY; // in px
const SAVING_INTERVAL = 5000;

const initChickens = ({
  chickens,
  removeFood,
  requestFood,
}: {
  chickens: Chicken[]
  removeFood: (id: string) => void
  requestFood: (coord: Coordinates) => Food | undefined
}) => {
  chickens.forEach(chicken => {
    chicken.setFoodMethods(removeFood, requestFood);
  })
}

const setGameItems = ({
  resizedWidth,
  resizedHeight,
  setObjects,
  setChickens,
  setFoodImgs,
  setFood,
}: {
  resizedWidth: number,
  resizedHeight: number,
  setObjects: (objects: StaticObject[]) => void,
  setChickens: (chickens: Chicken[]) => void,
  setFoodImgs: (imgs: HTMLImageElement[]) => void,
  setFood: (food: Food[]) => void,
}) => {
  Promise.all([
    createObjects(resizedWidth, resizedHeight),
    getChickens(resizedWidth, resizedHeight),
    getFoodImgs(),
  ]).then(([objects, chickens, foodImgs]) => {
    setObjects(objects);
    setChickens(chickens);
    setFoodImgs(foodImgs);
    setFood(getFood(foodImgs, resizedWidth, resizedHeight));
  });
}

const throtteFoodDrop = throttle((
  { imgs, left, top, addFood, width, height }: FoodProps & { addFood: (food: Food) => void },
) => {
  const food = new Food({
    imgs,
    top: Math.round(top / RESIZE_BY),
    left: Math.round(left / RESIZE_BY),
    width,
    height,
  });
  addFood(food);
}, 100, { leading: true, trailing: false });

const getClosestFood = (coord: Coordinates, food: Food[]) => {
  const allAvailableFood = food.filter(item => (
    item.isAvailable()
    && getDistance(coord, item) < MAX_FOOD_DISTANCE
  ));
  if(!allAvailableFood.length) {
    return undefined;
  }
  return getClosest({
    items: allAvailableFood,
    ...coord,
  });
}

const disableFeedingOnEsc = ({ toggleFeeding, isFeeding }: {
  toggleFeeding: () => void,
  isFeeding: boolean,
}) => {
  const stopFeedingOnEsc = (e: KeyboardEvent) => {
    if (e.code === "Escape" && isFeeding) {
      toggleFeeding();
    }
  };
  document.addEventListener("keydown", stopFeedingOnEsc);

  return () => {
    document.removeEventListener("keydown", stopFeedingOnEsc);
  };
}

const saveItemsToStorage = (storageKey: StorageKeys, items: { getSavingState: () => any }[]) => {
  const storage = items.map(item => item.getSavingState());
  if (!storage.length) {
    return;
  }
  setStorageKey(storageKey, storage);
}

const saveItemsOnInterval = (storageKey: StorageKeys, items: { getSavingState: () => any }[]) => {
  const id = setInterval(() => saveItemsToStorage(storageKey, items), SAVING_INTERVAL);
  return () => {
    saveItemsToStorage(storageKey, items);
    clearInterval(id);
  };
}

const isTouchEvent = (e: InteractEvent<HTMLCanvasElement>): e is React.TouchEvent<HTMLCanvasElement> => {
  return (e as React.TouchEvent<HTMLCanvasElement>).type.includes("touch");
}

export const Farm: React.FC = memo(() => {
  const { resizedWidth, resizedHeight } = useWindowDimensions(RESIZE_BY);
  const [
    {
      isDragging,
      isFeeding,
      isInfoOpen,
      objects,
      chickens,
      food,
    },
    dispatch,
  ] = useReducer(farmReducer, initialFarmState);
  const [foodImgs, setFoodImgs] = useState<HTMLImageElement[]>([]);
  const isDraggingFood = isFeeding && !!foodImgs.length && isDragging;

  const handleFoodDrop = useCallback((e: InteractEvent<HTMLCanvasElement>) => {
    e.persist();
    e.stopPropagation();

    if (!isDraggingFood) {
      return;
    }

    let left: number;
    let top: number;

    if(isTouchEvent(e)) {
      if(e.touches.length !== 1) {
        return;
      }
      left = e.touches[0].clientX;
      top = e.touches[0].clientY;
    } else {
      e.preventDefault();
      left = e.clientX;
      top = e.clientY;
    }

    throtteFoodDrop({
      left,
      top,
      imgs: foodImgs,
      addFood: (food: Food) => dispatch(addFoodAction(food)),
      width: resizedWidth,
      height: resizedHeight,
    });
  }, [isDraggingFood, foodImgs, resizedHeight, resizedWidth]);
  const toggleFoodDragging = useCallback((e: InteractEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if(!isTouchEvent(e)) {
      e.preventDefault();
    }

    dispatch(toggleDraggingAction())
  }, []);

  useEffect(() => initChickens({
    chickens,
    removeFood: (id: string) => dispatch(removeFoodAction(id)),
    requestFood: (coord: Coordinates) => getClosestFood(coord, food),
  }), [chickens, food])
  useEffect(() => disableFeedingOnEsc({
    toggleFeeding: () => dispatch(toggleFeedingAction()),
    isFeeding
  }), [isFeeding]);
  useEffect(() => {
    // It should only run on mount
    if(!chickens.length) {
      setGameItems({
        resizedWidth,
        resizedHeight,
        setObjects: (objects: StaticObject[]) => dispatch(setObjectsAction(objects)),
        setChickens: (chickens: Chicken[]) => dispatch(setChickensAction(chickens)),
        setFoodImgs,
        setFood: (food: Food[]) => dispatch(setFoodAction(food)),
      })
    }
  }, [resizedWidth, resizedHeight, chickens]);
  useEffect(
    () => saveItemsOnInterval(StorageKeys.chickens, chickens),
    [chickens, resizedHeight, resizedWidth]
  )
  useEffect(
    () => saveItemsOnInterval(StorageKeys.food, food),
    [food, resizedHeight, resizedWidth]
  )

  return (
    <div className={cx(styles.wrapper, isFeeding && styles.feeding)}>
      <div className={styles.bg}/>
      <StaticCanvas
        resizedWidth={resizedWidth}
        resizedHeight={resizedHeight}
        objects={objects}
      />
      <FoodCanvas
        resizedWidth={resizedWidth}
        resizedHeight={resizedHeight}
        toggleDragging={toggleFoodDragging}
        dropFood={handleFoodDrop}
        food={food}
        isDraggingFood={isDraggingFood}
      />
      <DynamicCanvas
        resizedWidth={resizedWidth}
        resizedHeight={resizedHeight}
        chickens={chickens}
      />
      <Menu
        isInfoOpen={isInfoOpen}
        isFeeding={isFeeding}
        chickens={chickens}
        dispatch={dispatch}
      />
    </div>
  );
});
