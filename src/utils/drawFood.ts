import React from "react";
import { Food } from "../models/food";
import { getStorageKey, StorageKeys } from "./localStorage";
import { FoodItems, DrawProps } from "../types/types";
import { SavedFoodState } from "./migrateSaves";

const FOOD_CANVAS_FRAME_THROTTLE = 30;

type DrawFoodObjectsProps = FoodItems &
  DrawProps & {
    animationIdRef: React.MutableRefObject<number>;
    isDraggingFood: boolean;
  };

export const getFood = (width: number, height: number, sprite: HTMLImageElement) => {
  const savedFood = getStorageKey(StorageKeys.food) as null | SavedFoodState[];
  if (!savedFood) {
    return [];
  }

  return savedFood.map((food: SavedFoodState) => {
    return new Food({ ...food, width, height, sprite });
  });
};

export const drawFoodObjects = ({
  canvasRef,
  resizedWidth,
  resizedHeight,
  food,
  animationIdRef,
  isDraggingFood,
}: DrawFoodObjectsProps) => {
  if (!canvasRef.current) {
    return;
  }
  const ctx = canvasRef.current.getContext("2d");
  if (!ctx) {
    return;
  }

  let frameCount = 0;
  ctx.imageSmoothingEnabled = false;
  window.cancelAnimationFrame(animationIdRef.current);
  const loop = () => {
    window.cancelAnimationFrame(animationIdRef.current);
    frameCount++;

    if (!isDraggingFood && frameCount < FOOD_CANVAS_FRAME_THROTTLE) {
      animationIdRef.current = window.requestAnimationFrame(loop);
      return;
    }
    frameCount = 0;
    ctx.clearRect(0, 0, resizedWidth, resizedHeight);

    food.forEach((singleFood) => singleFood.update({ ctx, resizedWidth, resizedHeight }));

    animationIdRef.current = window.requestAnimationFrame(loop);
  };

  loop();
};
