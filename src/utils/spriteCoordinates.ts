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
  coop: CanvasCoordinates;
  trough: CanvasCoordinates;
  food: {
    small: CanvasCoordinates;
    medium: CanvasCoordinates;
    large: CanvasCoordinates;
  };
  fence: {
    topLeft: CanvasCoordinates;
    topRight: CanvasCoordinates;
    bottomLeft: CanvasCoordinates;
    bottomRight: CanvasCoordinates;
    sideLeft: CanvasCoordinates;
    sideRight: CanvasCoordinates;
    top: CanvasCoordinates;
    bottom: CanvasCoordinates;
  };
}

const STANDARD_CHICKEN_DIMENSION = 16;
const STANDARD_FOOD_HEIGHT = 16;
const STANDARD_FOOD_WIDTH = 15;

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
  coop: {
    x: 213,
    y: 16,
    width: 56,
    height: 50,
  },
  trough: {
    x: 112,
    y: 83,
    width: 34,
    height: 15,
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
  fence: {
    topLeft: {
      x: 0,
      y: 0,
      width: 4,
      height: 16,
    },
    top: {
      x: 14,
      y: 0,
      width: 20,
      height: 16,
    },
    topRight: {
      x: 60,
      y: 0,
      width: 4,
      height: 16,
    },
    bottomLeft: {
      x: 0,
      y: 32,
      width: 4,
      height: 16,
    },
    sideLeft: {
      x: 0,
      y: 16,
      width: 4,
      height: 15,
    },
    sideRight: {
      x: 60,
      y: 16,
      width: 4,
      height: 15,
    },
    bottomRight: {
      x: 60,
      y: 32,
      width: 4,
      height: 16,
    },
    bottom: {
      x: 14,
      y: 32,
      width: 20,
      height: 16,
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
