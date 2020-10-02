import React, { useEffect, memo, useState, useReducer, useCallback } from "react";
import cx from "classnames";
import styles from "./farm.module.scss";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { getChickens } from "../../utils/drawChickens";
import { createObjects } from "../../utils/drawObjects";
import { getFoodImgs, getFood } from "../../utils/drawFood";
import { Chicken } from "../../models/chicken/Chicken";
import { Coordinates } from "../../types/types";
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
import { Food } from "../../models/food";
import { StaticCanvas } from "../StaticCanvas/StaticCanvas";
import { Menu } from "../menu/Menu";
import { ChickenCanvas } from "../chickenCanvas/ChickenCanvas";
import { getClosest, getDistance } from "../../utils/distance";
import { StaticObject } from "../../models/staticObject";
import { FoodCanvas } from "../foodCanvas/FoodCanvas";
import { RESIZE_CANVAS_BY } from "../../gameConsts";

const MAX_FOOD_DISTANCE = 300 / RESIZE_CANVAS_BY; // in px

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

const linkFoodToChickens = ({
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

export const Farm: React.FC = memo(() => {
  const { resizedWidth, resizedHeight } = useWindowDimensions(RESIZE_CANVAS_BY);
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
  const addFood = useCallback((food: Food) => dispatch(addFoodAction(food)), [])
  const toggleFeeding = useCallback(() => dispatch(toggleFeedingAction()), [])
  const toggleDragging = useCallback(() => dispatch(toggleDraggingAction()), [])

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

  useEffect(() => linkFoodToChickens({
    chickens,
    removeFood: (id: string) => dispatch(removeFoodAction(id)),
    requestFood: (coord: Coordinates) => getClosestFood(coord, food),
  }), [chickens, food])

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
        toggleDragging={toggleDragging}
        food={food}
        isDragging={isDragging}
        isFeeding={isFeeding}
        toggleFeeding={toggleFeeding}
        addFood={addFood}
        foodImages={foodImgs}
      />
      <ChickenCanvas
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
