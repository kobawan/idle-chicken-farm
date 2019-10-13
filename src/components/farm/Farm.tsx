import React, { useEffect, memo, useState, useCallback, useReducer } from "react";
import throttle from "lodash.throttle";
import cx from "classnames";
import styles from "./farm.module.scss";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { getObjects, getChickens, getFoodImgs, getFood } from "../../utils/drawImages";
import { Chicken } from "../../models/chicken";
import { Coordinates } from "../../types/types";
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
import { Food, FoodProps } from "../../models/food";
import { StaticCanvas } from "../StaticCanvas/StaticCanvas";
import { Menu } from "../menu/Menu";
import { DynamicCanvas } from "../dynamicCanvas/DynamicCanvas";
import { getClosest, getDistance } from "../../utils/distance";
import { StaticObject } from "../../models/staticObject";

const RESIZE_BY = 2;
const MAX_FOOD_DISTANCE = 300 / RESIZE_BY; // in px

const initChickens = (
  chickens: Chicken[],
  removeFood: (id: string) => void,
  requestFood: (coord: Coordinates) => Food | undefined
) => {
  chickens.forEach(chicken => {
    chicken.setFoodMethods(removeFood, requestFood);
  })
}

const setGameItems = (
  resizedWidth: number,
  resizedHeight: number,
  setObjects: (objects: StaticObject[]) => void,
  setChickens: (chickens: Chicken[]) => void,
  setFoodImgs: (imgs: HTMLImageElement[]) => void,
  setFood: (food: Food[]) => void,
) => {
  Promise.all([
    getObjects(),
    getChickens(resizedWidth, resizedHeight),
    getFoodImgs(),
  ]).then(([objects, chickens, foodImgs]) => {
    setObjects(objects);
    setChickens(chickens);
    setFoodImgs(foodImgs);
    setFood(getFood(foodImgs));
  });
}

const throtteFoodDrop = throttle((
  { imgs, left, top, addFood }: FoodProps & { addFood: (food: Food) => void },
) => {
  const food = new Food({
    imgs,
    top: Math.round(top / RESIZE_BY),
    left: Math.round(left / RESIZE_BY),
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

const disableFeedingOnEsc = (toggleFeeding: () => void, isFeeding: boolean) => {
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
  if(!items.length) {
    return;
  }
  setStorageKey(storageKey, items.map(item => item.getSavingState()))
}

const saveItemsOnInterval = (storageKey: StorageKeys, items: { getSavingState: () => any }[]) => {
  const id = setInterval(() => saveItemsToStorage(storageKey, items), 5000);
  return () => {
    saveItemsToStorage(storageKey, items);
    clearInterval(id);
  };
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

  const addFood = useCallback((food: Food | Food[]) => dispatch(addFoodAction(food)), [dispatch]);
  const removeFood = useCallback((id: string) => dispatch(removeFoodAction(id)), [dispatch]);
  const requestFood = useCallback((coord: Coordinates) => getClosestFood(coord, food), [food]);
  const handleFoodDrop = useCallback((e) => {
    e.persist();
    if (!isFeeding || !foodImgs.length || !isDragging) {
      return;
    }

    throtteFoodDrop({
      left: e.clientX,
      top: e.clientY,
      imgs: foodImgs,
      addFood,
    });
  }, [isFeeding, foodImgs, isDragging, addFood]);
  const toggleFoodDragging = useCallback(() => dispatch(toggleDraggingAction()), [dispatch])

  useEffect(() => initChickens(chickens, removeFood, requestFood), [chickens, removeFood, requestFood])
  useEffect(() => disableFeedingOnEsc(
    () => dispatch(toggleFeedingAction()),
    isFeeding
  ), [dispatch, isFeeding]);
  useEffect(() => setGameItems(
    resizedWidth,
    resizedHeight,
    (objects: StaticObject[]) => dispatch(setObjectsAction(objects)),
    (chickens: Chicken[]) => dispatch(setChickensAction(chickens)),
    setFoodImgs,
    addFood,
  ), [dispatch, resizedWidth, resizedHeight, setFoodImgs, addFood]);
  useEffect(() => saveItemsOnInterval(StorageKeys.chickens, chickens), [chickens])
  useEffect(() => saveItemsOnInterval(StorageKeys.food, food), [food])

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
        toggleDragging={toggleFoodDragging}
        dropFood={handleFoodDrop}
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
