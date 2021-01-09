import React from "react";
import { Chicken } from "../models/chicken/chicken";
import { ChickenBreed, ChickenItems, DrawProps } from "../types/types";
import { getStorageKey, StorageKeys } from "./localStorage";
import { getAvailableNames, generateName } from "./chickenNameUtils";
import { SavedChickenState } from "./migrateSaves";

const CHICKEN_REFRESH_RATE = 500;

type DrawDynamicObjectsProps = ChickenItems &
  DrawProps & { animationIdRef: React.MutableRefObject<number> };

export const getChickens = (width: number, height: number, sprite: HTMLImageElement) => {
  const savedChickens = getStorageKey(StorageKeys.chickens) as null | SavedChickenState[];
  if (!savedChickens) {
    return Object.values(ChickenBreed).reduce<Chicken[]>((chickens, breed, index) => {
      const gender = index === 0 ? "male" : "female";
      const chicken = new Chicken({
        width,
        height,
        breed,
        gender,
        name: generateName(gender, getAvailableNames(chickens)),
        sprite,
      });
      chickens.push(chicken);
      return chickens;
    }, []);
  }

  return savedChickens.map((props: SavedChickenState) => {
    return new Chicken({ width, height, sprite, ...props });
  });
};

export const drawChickens = ({
  canvasRef,
  resizedWidth,
  resizedHeight,
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
    ctx.clearRect(0, 0, resizedWidth, resizedHeight);

    chickens.forEach((chicken) =>
      chicken.update({
        ctx,
        timestamp: performance.now(),
        resizedWidth,
        resizedHeight,
      }),
    );
  }, CHICKEN_REFRESH_RATE);
};
