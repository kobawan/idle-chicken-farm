import React, { useRef, useEffect, useCallback } from "react";
import throttle from "lodash.throttle";
import styles from "./foodCanvas.module.scss";
import { drawFoodObjects } from "../../utils/drawFood";
import { InteractEvent, FoodItems, Coordinates } from "../../types/types";
import { StorageKeys } from "../../utils/saveUtils/localStorage";
import { useAutoSaveEffect } from "../../utils/saveUtils/save";
import { isTouchEvent, getInteractionPos, isMultiFingerTouchEvent } from "../../utils/devices";
import { Food, FoodProps } from "../../models/food";
import { EventName } from "../../utils/eventUtils/events";
import { AllFarmActions } from "../farm/reducer";
import {
  addFoodAction,
  removeFoodAction,
  toggleDraggingAction,
  toggleFeedingAction,
} from "../farm/actions";
import { useEventEffect } from "../../utils/eventUtils/useEventEffect";
import { CustomEventEmitter } from "../../utils/eventUtils/EventEmitter";
import { globalPositionManager } from "../../models/globalPositionManager";
import { FOOD_SIZE } from "../../utils/spriteCoordinates";

interface FoodCanvasProps extends FoodItems {
  canvasWidth: number;
  canvasHeight: number;
  isDragging: boolean;
  isFeeding: boolean;
  sprite: HTMLImageElement;
  dispatch: React.Dispatch<AllFarmActions>;
}

const throtteFoodDrop = throttle(
  ({
    sprite,
    left,
    top,
    addFood,
    canvasWidth,
    canvasHeight,
  }: FoodProps & { addFood: (food: Food) => void }) => {
    if (!globalPositionManager.canGoToCoordinates({ left, top, ...FOOD_SIZE })) {
      return;
    }

    const food = new Food({
      sprite,
      top,
      left,
      canvasWidth,
      canvasHeight,
    });
    addFood(food);
  },
  100,
  { leading: true, trailing: false },
);

export const FoodCanvas: React.FC<FoodCanvasProps> = ({
  canvasWidth,
  canvasHeight,
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
      const closestFood = globalPositionManager.getClosestFood(position, food);

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
  const addFood = useCallback((food: Food) => dispatch(addFoodAction(food)), [dispatch]);

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
      if (!isDraggingFood || isMultiFingerTouchEvent(e)) {
        return;
      }

      const pos = getInteractionPos(e);

      e.persist();
      e.stopPropagation();
      if (!isTouchEvent(e)) {
        e.preventDefault();
      }

      throtteFoodDrop({
        ...pos,
        sprite,
        addFood,
        canvasWidth,
        canvasHeight,
      });
    },
    [isDraggingFood, canvasHeight, canvasWidth, sprite, addFood],
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
      canvasWidth,
      canvasHeight,
      animationIdRef,
      food,
      isDraggingFood,
    });
  }, [canvasWidth, canvasHeight, food, isDraggingFood, animationIdRef]);
  useAutoSaveEffect({
    storageKey: StorageKeys.food,
    items: food,
    canvasWidth,
    canvasHeight,
  });
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
      width={canvasWidth}
      height={canvasHeight}
      className={styles.canvas}
    ></canvas>
  );
};
