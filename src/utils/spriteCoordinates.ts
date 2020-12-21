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
}

export const spriteCoordinatesMap: SpriteCoordinatesMap = {
  chicken: {
    [ChickenBreed.orange]: {
      [ChickenPose.default]: {
        x: 1,
        y: 193,
        width: 16,
        height: 16,
      },
      [ChickenPose.walking]: {
        x: 1,
        y: 209,
        width: 16,
        height: 16,
      },
      [ChickenPose.resting]: {
        x: 1,
        y: 225,
        width: 16,
        height: 16,
      },
    },
    [ChickenBreed.white]: {
      [ChickenPose.default]: {
        x: 17,
        y: 193,
        width: 16,
        height: 16,
      },
      [ChickenPose.walking]: {
        x: 17,
        y: 209,
        width: 16,
        height: 16,
      },
      [ChickenPose.resting]: {
        x: 17,
        y: 225,
        width: 16,
        height: 16,
      },
    },
    [ChickenBreed.lightbrown]: {
      [ChickenPose.default]: {
        x: 33,
        y: 193,
        width: 16,
        height: 16,
      },
      [ChickenPose.walking]: {
        x: 33,
        y: 209,
        width: 16,
        height: 16,
      },
      [ChickenPose.resting]: {
        x: 33,
        y: 225,
        width: 16,
        height: 16,
      },
    },
    [ChickenBreed.brown]: {
      [ChickenPose.default]: {
        x: 49,
        y: 193,
        width: 16,
        height: 16,
      },
      [ChickenPose.walking]: {
        x: 49,
        y: 209,
        width: 16,
        height: 16,
      },
      [ChickenPose.resting]: {
        x: 49,
        y: 225,
        width: 16,
        height: 16,
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
      width: 15,
      height: 16,
    },
    medium: {
      x: 128,
      y: 96,
      width: 15,
      height: 16,
    },
    large: {
      x: 144,
      y: 96,
      width: 15,
      height: 16,
    },
  },
};
