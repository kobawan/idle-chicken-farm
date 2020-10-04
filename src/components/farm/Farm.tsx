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
import { OnDetectTooltipCbProps, TooltipOverlay, TooltipProps } from "../tooltipOverlay/TooltipOverlay";
import { InteractionLayer } from "../interactionLayer/InteractionLayer";

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
  chickens: Chicken[],
  {
    event,
    addTooltip,
    removeTooltip,
    hasTooltip,
  }: OnDetectTooltipCbProps,
) => {
  const { clientX, clientY } = event;
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
  const onDetectTooltipCb = useCallback(
    (args: OnDetectTooltipCbProps) => handleChickenHover(chickens, args),
    [chickens]
  )

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
    <div className={cx(styles.wrapper, isFeeding && styles.feeding)}>
      <InteractionLayer>
        <div className={styles.bg}/>
        <StaticCanvas
          resizedWidth={resizedWidth}
          resizedHeight={resizedHeight}
          objects={objects}
        />
        <FoodCanvas
          resizedWidth={resizedWidth}
          resizedHeight={resizedHeight}
          food={food}
          isDragging={isDragging}
          isFeeding={isFeeding}
          foodImages={foodImgs}
          dispatch={dispatch}
        />
        <ChickenCanvas
          resizedWidth={resizedWidth}
          resizedHeight={resizedHeight}
          chickens={chickens}
        />
        <TooltipOverlay onDetectTooltipCb={onDetectTooltipCb} />
        <Menu
          isInfoOpen={isInfoOpen}
          isFeeding={isFeeding}
          chickens={chickens}
          dispatch={dispatch}
        />
      </InteractionLayer>
    </div>
  );
});
