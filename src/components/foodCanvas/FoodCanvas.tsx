import React, { useRef, useEffect, useCallback } from "react";
import throttle from "lodash.throttle";
import styles from "./foodCanvas.module.scss";
import { drawFoodObjects } from "../../utils/drawFood";
import { InteractEvent, FoodItems } from "../../types/types";
import { StorageKeys } from "../../utils/localStorage";
import { saveItemsOnInterval } from "../../utils/saveItems";
import { isTouchEvent, getInteractionPos } from "../../utils/devices";
import { Food, FoodProps } from "../../models/food";
import { RESIZE_CANVAS_BY } from "../../gameConsts";

interface FoodCanvasProps extends FoodItems {
  resizedWidth: number;
  resizedHeight: number;
  toggleDragging: () => void;
  isDragging: boolean;
  isFeeding: boolean;
  toggleFeeding: () => void;
  addFood: (food: Food) => void;
  foodImages: HTMLImageElement[];
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

const throtteFoodDrop = throttle((
  { imgs, left, top, addFood, width, height }: FoodProps & { addFood: (food: Food) => void },
) => {
  const food = new Food({
    imgs,
    top: Math.round(top / RESIZE_CANVAS_BY),
    left: Math.round(left / RESIZE_CANVAS_BY),
    width,
    height,
  });
  addFood(food);
}, 100, { leading: true, trailing: false });

export const FoodCanvas: React.FC<FoodCanvasProps> = ({
  resizedWidth,
  resizedHeight,
  food,
  toggleDragging,
  isDragging,
  isFeeding,
  toggleFeeding,
  addFood,
  foodImages,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef(0);
  const isDraggingFood = isFeeding && !!foodImages.length && isDragging;

  const toggleFoodDragging = useCallback((e: InteractEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if(!isTouchEvent(e)) {
      e.preventDefault();
    }

    toggleDragging();
  }, [toggleDragging]);
  const dropFood = useCallback((e: InteractEvent<HTMLCanvasElement>) => {
    if (!isDraggingFood) {
      return;
    }

    const pos = getInteractionPos(e);
    if(!pos) {
      return;
    }

    e.persist();
    e.stopPropagation();
    if(!isTouchEvent(e)) {
      e.preventDefault();
    }

    throtteFoodDrop({
      ...pos,
      imgs: foodImages,
      addFood,
      width: resizedWidth,
      height: resizedHeight,
    });
  }, [isDraggingFood, addFood, foodImages, resizedHeight, resizedWidth]);
  const onDragFinished = useCallback((e: InteractEvent<HTMLCanvasElement>) => {
    dropFood(e);
    toggleFoodDragging(e);
  }, [dropFood, toggleFoodDragging]);

  useEffect(() => {
    drawFoodObjects({
      canvasRef,
      resizedWidth,
      resizedHeight,
      animationIdRef,
      food,
      isDraggingFood,
    })
  }, [resizedWidth, resizedHeight, food, isDraggingFood, animationIdRef]);
  useEffect(
    () => saveItemsOnInterval(StorageKeys.food, food),
    [food, resizedHeight, resizedWidth]
  )
  useEffect(() => disableFeedingOnEsc({ toggleFeeding, isFeeding }), [isFeeding, toggleFeeding]);

  return (
    <canvas
      ref={canvasRef}
      width={resizedWidth}
      height={resizedHeight}
      className={styles.canvas}
      onTouchStart={toggleFoodDragging}
      onTouchEnd={onDragFinished}
      onTouchMove={dropFood}
      onMouseDown={toggleFoodDragging}
      onMouseUp={onDragFinished}
      onMouseMove={dropFood}
    ></canvas>
  );
};
