import React from "react";
import food1 from "../sprites/food1.png";
import food2 from "../sprites/food2.png";
import food3 from "../sprites/food3.png";
import { loadMultipleImages } from "./loadImages";
import { Food } from "../models/food";
import { getStorageKey, StorageKeys } from "./localStorage";
import { FoodItems, DrawProps } from "../types/types";
import { SavedFoodStateV2 } from "./migrateSaves";

const FOOD_CANVAS_FRAME_THROTTLE = 30;

type DrawFoodObjectsProps = FoodItems &
  DrawProps & {
    animationIdRef: React.MutableRefObject<number>;
    isDraggingFood: boolean;
  };

export const getFoodImgs = async () => {
  return await loadMultipleImages([food1, food2, food3]);
};

export const getFood = (imgs: HTMLImageElement[], width: number, height: number) => {
  const savedFood = getStorageKey(StorageKeys.food) as null | SavedFoodStateV2[];
  if (!savedFood) {
    return [];
  }

  return savedFood.map((food: SavedFoodStateV2) => {
    return new Food({ ...food, imgs, width, height });
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
