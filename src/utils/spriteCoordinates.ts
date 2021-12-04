import { RESIZE_BY } from "../gameConfig";
import { ChickenPose } from "../models/chicken/types";
import { ChickenBreed } from "../types/types";

export interface CanvasCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ChickenSprite = Record<ChickenPose, CanvasCoordinates>;

interface SpriteCoordinatesMap {
  chicken: Record<ChickenBreed, ChickenSprite>;
  food: {
    small: CanvasCoordinates;
    medium: CanvasCoordinates;
    large: CanvasCoordinates;
  };
}

const STANDARD_CHICKEN_DIMENSION = 16;
const STANDARD_FOOD_HEIGHT = 16;
const STANDARD_FOOD_WIDTH = 15;

export const FENCE_SIZE = 16 * RESIZE_BY;

// TODO: remove this
export const spriteCoordinatesMap: SpriteCoordinatesMap = {
  chicken: {
    [ChickenBreed.orange]: {
      [ChickenPose.default]: {
        x: 1,
        y: 193,
        width: STANDARD_CHICKEN_DIMENSION,
        height: STANDARD_CHICKEN_DIMENSION,
      },
      [ChickenPose.walking]: {
        x: 1,
        y: 209,
        width: STANDARD_CHICKEN_DIMENSION,
        height: STANDARD_CHICKEN_DIMENSION,
      },
      [ChickenPose.resting]: {
        x: 1,
        y: 225,
        width: STANDARD_CHICKEN_DIMENSION,
        height: STANDARD_CHICKEN_DIMENSION,
      },
    },
    [ChickenBreed.white]: {
      [ChickenPose.default]: {
        x: 17,
        y: 193,
        width: STANDARD_CHICKEN_DIMENSION,
        height: STANDARD_CHICKEN_DIMENSION,
      },
      [ChickenPose.walking]: {
        x: 17,
        y: 209,
        width: STANDARD_CHICKEN_DIMENSION,
        height: STANDARD_CHICKEN_DIMENSION,
      },
      [ChickenPose.resting]: {
        x: 17,
        y: 225,
        width: STANDARD_CHICKEN_DIMENSION,
        height: STANDARD_CHICKEN_DIMENSION,
      },
    },
    [ChickenBreed.lightbrown]: {
      [ChickenPose.default]: {
        x: 33,
        y: 193,
        width: STANDARD_CHICKEN_DIMENSION,
        height: STANDARD_CHICKEN_DIMENSION,
      },
      [ChickenPose.walking]: {
        x: 33,
        y: 209,
        width: STANDARD_CHICKEN_DIMENSION,
        height: STANDARD_CHICKEN_DIMENSION,
      },
      [ChickenPose.resting]: {
        x: 33,
        y: 225,
        width: STANDARD_CHICKEN_DIMENSION,
        height: STANDARD_CHICKEN_DIMENSION,
      },
    },
    [ChickenBreed.brown]: {
      [ChickenPose.default]: {
        x: 49,
        y: 193,
        width: STANDARD_CHICKEN_DIMENSION,
        height: STANDARD_CHICKEN_DIMENSION,
      },
      [ChickenPose.walking]: {
        x: 49,
        y: 209,
        width: STANDARD_CHICKEN_DIMENSION,
        height: STANDARD_CHICKEN_DIMENSION,
      },
      [ChickenPose.resting]: {
        x: 49,
        y: 225,
        width: STANDARD_CHICKEN_DIMENSION,
        height: STANDARD_CHICKEN_DIMENSION,
      },
    },
  },
  food: {
    small: {
      x: 111,
      y: 96,
      width: STANDARD_FOOD_WIDTH,
      height: STANDARD_FOOD_HEIGHT,
    },
    medium: {
      x: 128,
      y: 96,
      width: STANDARD_FOOD_WIDTH,
      height: STANDARD_FOOD_HEIGHT,
    },
    large: {
      x: 144,
      y: 96,
      width: STANDARD_FOOD_WIDTH,
      height: STANDARD_FOOD_HEIGHT,
    },
  },
};

// TODO: should RESIZE_BY be used directly in spriteCoordinatesMap?
export const FOOD_SIZE = {
  width: STANDARD_FOOD_WIDTH * RESIZE_BY,
  height: STANDARD_FOOD_HEIGHT * RESIZE_BY,
};

export const CHICKEN_SIZE = {
  width: STANDARD_CHICKEN_DIMENSION * RESIZE_BY,
  height: STANDARD_CHICKEN_DIMENSION * RESIZE_BY,
};

export const FOOD_RADIUS = FOOD_SIZE.width / 2;
export const CHICKEN_RADIUS = CHICKEN_SIZE.height / 2;
