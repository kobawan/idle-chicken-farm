import React, { useRef, useEffect, useCallback } from "react";
import throttle from "lodash.throttle";
import styles from "./foodCanvas.module.scss";
import { drawFoodObjects } from "../../utils/drawFood";
import { InteractEvent, FoodItems, Coordinates } from "../../types/types";
import { StorageKeys } from "../../utils/saveUtils/localStorage";
import { saveItemsOnInterval } from "../../utils/saveUtils/save";
import { isTouchEvent, getInteractionPos } from "../../utils/devices";
import { Food, FoodProps } from "../../models/food";
import { EventName } from "../../utils/eventUtils/events";
import { AllFarmActions } from "../farm/reducer";
import {
  addFoodAction,
  removeFoodAction,
  toggleDraggingAction,
  toggleFeedingAction,
} from "../farm/actions";
import { useEventEffect } from "../../utils/useEventEffect";
import { getClosest, getDistance } from "../../utils/distance";
import { CustomEventEmitter } from "../../utils/eventUtils/EventEmitter";

interface FoodCanvasProps extends FoodItems {
  resizedWidth: number;
  resizedHeight: number;
  isDragging: boolean;
  isFeeding: boolean;
  sprite: HTMLImageElement;
  dispatch: React.Dispatch<AllFarmActions>;
}

const MAX_FOOD_DISTANCE = 300; // in px

const getClosestFood = (coord: Coordinates, food: Food[]) => {
  const allAvailableFood = food.filter(
    (item) => item.isAvailable() && getDistance(coord, item) < MAX_FOOD_DISTANCE,
  );
  if (!allAvailableFood.length) {
    return undefined;
  }
  return getClosest({
    items: allAvailableFood,
    ...coord,
  });
};

const throtteFoodDrop = throttle(
  ({
    sprite,
    left,
    top,
    addFood,
    width,
    height,
  }: FoodProps & { addFood: (food: Food) => void }) => {
    const food = new Food({
      sprite,
      top,
      left,
      width,
      height,
    });
    addFood(food);
  },
  100,
  { leading: true, trailing: false },
);

export const FoodCanvas: React.FC<FoodCanvasProps> = ({
  resizedWidth,
  resizedHeight,
  food,
  isDragging,
  isFeeding,
  dispatch,
  sprite,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef(0);
  const isDraggingFood = isFeeding && isDragging;

  const requestFood = useCallback(
    ({ position, id }: { position: Coordinates; id: string }) => {
      const closestFood = getClosestFood(position, food);

      if (closestFood) {
        CustomEventEmitter.emit(EventName.FoundRequestedFood, {
          food: closestFood,
          id,
        });
      } else {
        CustomEventEmitter.emit(EventName.NotFoundRequestedFood, { id });
      }
    },
    [food],
  );
  const removeFood = useCallback((id: string) => dispatch(removeFoodAction(id)), [dispatch]);

  const toggleFoodDragging = useCallback(
    (e: InteractEvent<HTMLCanvasElement>) => {
      e.stopPropagation();
      if (!isTouchEvent(e)) {
        e.preventDefault();
      }

      dispatch(toggleDraggingAction());
    },
    [dispatch],
  );

  const dropFood = useCallback(
    (e: InteractEvent<HTMLCanvasElement>) => {
      if (!isDraggingFood) {
        return;
      }

      const pos = getInteractionPos(e);
      if (!pos) {
        return;
      }

      e.persist();
      e.stopPropagation();
      if (!isTouchEvent(e)) {
        e.preventDefault();
      }

      throtteFoodDrop({
        ...pos,
        sprite,
        addFood: (food: Food) => dispatch(addFoodAction(food)),
        width: resizedWidth,
        height: resizedHeight,
      });
    },
    [isDraggingFood, resizedHeight, resizedWidth, dispatch, sprite],
  );

  const onDragFinished = useCallback(
    (e: InteractEvent<HTMLCanvasElement>) => {
      dropFood(e);
      toggleFoodDragging(e);
    },
    [dropFood, toggleFoodDragging],
  );

  useEffect(() => {
    drawFoodObjects({
      canvasRef,
      resizedWidth,
      resizedHeight,
      animationIdRef,
      food,
      isDraggingFood,
    });
  }, [resizedWidth, resizedHeight, food, isDraggingFood, animationIdRef]);
  useEffect(() => saveItemsOnInterval(StorageKeys.food, food), [food, resizedHeight, resizedWidth]);
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
  }, [isFeeding, dispatch]);

  useEventEffect(EventName.StartDraggingFood, toggleFoodDragging);
  useEventEffect(EventName.StopDraggingFood, onDragFinished);
  useEventEffect(EventName.DropFood, dropFood);
  useEventEffect(EventName.RequestFood, requestFood);
  useEventEffect(EventName.RemoveFood, removeFood);

  return (
    <canvas
      ref={canvasRef}
      width={resizedWidth}
      height={resizedHeight}
      className={styles.canvas}
    ></canvas>
  );
};
