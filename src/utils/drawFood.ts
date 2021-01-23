import React from "react";
import { Food } from "../models/food";
import { getStorageKey, StorageKeys } from "./saveUtils/localStorage";
import { FoodItems, DrawProps } from "../types/types";
import { SavedFoodState } from "./saveUtils/migrateSaves";
import { FOOD_CANVAS_FRAME_THROTTLE } from "../gameConfig";

type DrawFoodObjectsProps = FoodItems &
  DrawProps & {
    animationIdRef: React.MutableRefObject<number>;
    isDraggingFood: boolean;
  };

export const getFood = (canvasWidth: number, canvasHeight: number, sprite: HTMLImageElement) => {
  const savedFood = getStorageKey(StorageKeys.food) as null | SavedFoodState[];
  if (!savedFood) {
    return [];
  }

  return savedFood.map(({ topRatio, leftRatio, ...props }: SavedFoodState) => {
    return new Food({
      ...props,
      left: leftRatio * canvasWidth,
      top: topRatio * canvasHeight,
      canvasWidth,
      canvasHeight,
      sprite,
    });
  });
};

const draw = ({
  ctx,
  food,
  canvasHeight,
  canvasWidth,
}: Pick<DrawFoodObjectsProps, "food" | "canvasHeight" | "canvasWidth"> & {
  ctx: CanvasRenderingContext2D;
}) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  food.forEach((singleFood) => singleFood.update({ ctx }));
};

export const drawFoodObjects = ({
  canvasRef,
  canvasWidth,
  canvasHeight,
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

  // to avoid interaction delays
  draw({ ctx, food, canvasHeight, canvasWidth });

  const loop = () => {
    window.cancelAnimationFrame(animationIdRef.current);
    frameCount++;

    if (isDraggingFood || frameCount >= FOOD_CANVAS_FRAME_THROTTLE) {
      frameCount = 0;

      draw({ ctx, food, canvasHeight, canvasWidth });
    }
    animationIdRef.current = window.requestAnimationFrame(loop);
  };

  loop();
};
