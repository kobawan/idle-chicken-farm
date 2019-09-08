import React, { useEffect, memo, useState, useCallback, useReducer } from "react";
import throttle from "lodash.throttle";
import cx from "classnames";
import styles from "./farm.module.scss";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { getObjects, getChickens, getFoodImgs } from "../../utils/drawImages";
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
import { Food, FoodProps } from "../../utils/food";
import { StaticCanvas } from "../StaticCanvas/StaticCanvas";
import { Menu } from "../menu/Menu";
import { DynamicCanvas } from "../dynamicCanvas/DynamicCanvas";

const RESIZE_BY = 2;

interface AddFoodItemOptions extends FoodProps {
  addFood: (food: Food) => void;
}

const addFoodItem = throttle((
  { imgs, left, top, addFood }: AddFoodItemOptions,
) => {
  const food = new Food({
    imgs,
    top: Math.round(top / RESIZE_BY),
    left: Math.round(left / RESIZE_BY),
  });
  addFood(food);
}, 100, { leading: true, trailing: false });

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

  const addFood = (food: Food) => dispatch(addFoodAction(food));
  const removeFood = (id: string) => dispatch(removeFoodAction(id));
  const requestFood = () => food;
  chickens.forEach(chicken => {
    chicken.setFoodMethods(removeFood, requestFood);
  })

  const dropFood = useCallback((e) => {
    e.persist();
    if (!isFeeding || !foodImgs.length || !isDragging) {
      return;
    }

    addFoodItem({
      left: e.clientX,
      top: e.clientY,
      imgs: foodImgs,
      addFood,
    });
  }, [isFeeding, foodImgs, isDragging]);

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
      getFoodImgs(),
    ]).then(([objects, chickens, foodImgs]) => {
      dispatch(setObjectsAction(objects));
      dispatch(setChickensAction(chickens));
      setFoodImgs(foodImgs);
    });
  }, [resizedWidth, resizedHeight]);

  useEffect(() => {
    // @todo also save chickens state
    saveChickensToStorage(chickens);
    return () => { saveChickensToStorage(chickens) };
  }, [chickens])

  return (
    <div className={cx(styles.wrapper, isFeeding && styles.feeding)}>
      <div className={styles.bg}/>
      <StaticCanvas
        resizedWidth={resizedWidth}
        resizedHeight={resizedHeight}
        objects={objects}
        food={food}
      />
      <DynamicCanvas
        resizedWidth={resizedWidth}
        resizedHeight={resizedHeight}
        chickens={chickens}
        toggleDragging={() => dispatch(toggleDraggingAction())}
        dropFood={dropFood}
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
