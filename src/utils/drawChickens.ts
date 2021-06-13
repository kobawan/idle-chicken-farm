import React from "react";
import { Chicken } from "../models/chicken/chicken";
import { ChickenBreed, ChickenItems, DrawProps } from "../types/types";
import { getStorageKey, StorageKeys } from "./saveUtils/localStorage";
import { getAvailableNames, generateName } from "./chickenNameUtils";
import { SavedChickenState } from "./saveUtils/migrateSaves";
import { CHICKEN_REFRESH_RATE } from "../gameConfig";

type DrawDynamicObjectsProps = ChickenItems &
  DrawProps & { animationIdRef: React.MutableRefObject<number> };

export const getChickens = (
  canvasWidth: number,
  canvasHeight: number,
  sprites: HTMLImageElement[],
) => {
  const savedChickens = getStorageKey(StorageKeys.chickens) as null | SavedChickenState[];
  if (!savedChickens) {
    return Object.values(ChickenBreed).reduce<Chicken[]>((chickens, breed, index) => {
      const gender = index === 0 ? "male" : "female";
      const chicken = new Chicken({
        canvasWidth,
        canvasHeight,
        breed,
        gender,
        name: generateName(gender, getAvailableNames(chickens)),
        sprites,
      });
      chickens.push(chicken);
      return chickens;
    }, []);
  }

  return savedChickens.map(({ topRatio, leftRatio, ...props }: SavedChickenState) => {
    return new Chicken({
      canvasWidth,
      canvasHeight,
      sprites,
      top: topRatio ? topRatio * canvasHeight : undefined,
      left: leftRatio ? leftRatio * canvasWidth : undefined,
      ...props,
    });
  });
};

export const drawChickens = ({
  canvasRef,
  canvasWidth,
  canvasHeight,
  chickens,
  animationIdRef,
}: DrawDynamicObjectsProps) => {
  if (!canvasRef.current) {
    return;
  }
  const ctx = canvasRef.current.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.imageSmoothingEnabled = false;
  window.clearInterval(animationIdRef.current);
  animationIdRef.current = window.setInterval(() => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    chickens.forEach((chicken) =>
      chicken.update({
        ctx,
        timestamp: performance.now(),
      }),
    );
  }, CHICKEN_REFRESH_RATE);
};
