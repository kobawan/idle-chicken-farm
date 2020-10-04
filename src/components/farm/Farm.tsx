import React, { useEffect, memo, useState, useReducer, useCallback } from "react";
import cx from "classnames";
import styles from "./farm.module.scss";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { getChickens } from "../../utils/drawChickens";
import { createObjects } from "../../utils/drawObjects";
import { getFoodImgs, getFood } from "../../utils/drawFood";
import { Chicken } from "../../models/chicken/chicken";
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
import { FoodCanvas } from "../foodCanvas/FoodCanvas";
import { RESIZE_CANVAS_BY } from "../../gameConsts";
import { TooltipOverlay, TooltipProps } from "../tooltipOverlay/TooltipOverlay";

const MAX_FOOD_DISTANCE = 300 / RESIZE_CANVAS_BY; // in px

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

const handleChickenHover = (
  e: React.MouseEvent<HTMLDivElement>,
  chickens: Chicken[],
  addTooltip: (props: TooltipProps) => void,
  removeTooltip: (id: string) => void,
  hasTooltip: (id: string) => boolean,
) => {
  const { clientX, clientY } = e;
  chickens.forEach(chicken => {
    const { id, name, gender } = chicken;
    const { minX, minY, maxX, maxY } = chicken.getBoundaries();
    const withinBoundaries = clientX >= minX && clientX <= maxX && clientY >= minY && clientY <= maxY
    const isHovered = hasTooltip(id);

    if(withinBoundaries && !isHovered) {
      addTooltip({
        id,
        text: `${gender === 'male' ? '♂' : '♀'} ${name}`,
        minX,
        minY,
        maxX,
        maxY
      })
      return;
    }
    if(!withinBoundaries && isHovered) {
      removeTooltip(id)
    }
  })
};

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
  const [tooltipProps, setTooltipProps] = useState<TooltipProps[]>([]);
  const addTooltip = useCallback(
    (tProps: TooltipProps) => setTooltipProps([tProps, ...tooltipProps]),
    [tooltipProps]
  )
  const removeTooltip = useCallback(
    (id: string) => setTooltipProps(tooltipProps.filter(p => p.id !== id)),
    [tooltipProps]
  )
  const hasTooltip = useCallback(
    (id: string) => tooltipProps.some(p => p.id === id)
  , [tooltipProps])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleChickenHover(e, chickens, addTooltip, removeTooltip, hasTooltip);
  }, [chickens, addTooltip, removeTooltip, hasTooltip])

  useEffect(() => {
    // It should only run on mount
    if(!chickens.length) {
      Promise.all([
        createObjects(resizedWidth, resizedHeight),
        getChickens(resizedWidth, resizedHeight),
        getFoodImgs(),
      ]).then(([objects, chickens, foodImgs]) => {
        dispatch(setObjectsAction(objects));
        dispatch(setChickensAction(chickens));
        setFoodImgs(foodImgs);
        dispatch(setFoodAction(getFood(foodImgs, resizedWidth, resizedHeight)))
      });
    }
  }, [resizedWidth, resizedHeight, chickens]);

  useEffect(() => linkFoodToChickens({
    chickens,
    removeFood: (id: string) => dispatch(removeFoodAction(id)),
    requestFood: (coord: Coordinates) => getClosestFood(coord, food),
  }), [chickens, food])

  return (
    <div
      className={cx(styles.wrapper, isFeeding && styles.feeding)}
      onMouseMove={onMouseMove}
    >
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
      {/* <TooltipOverlay tooltips={tooltipProps} /> */}
      <Menu
        isInfoOpen={isInfoOpen}
        isFeeding={isFeeding}
        chickens={chickens}
        dispatch={dispatch}
      />
    </div>
  );
});
