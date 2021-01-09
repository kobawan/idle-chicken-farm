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
  fence: {
    topLeft: {
      x: 0,
      y: 0,
      width: 14,
      height: 16,
    },
    top: {
      x: 14,
      y: 0,
      width: 20,
      height: 16,
    },
    topRight: {
      x: 50,
      y: 0,
      width: 14,
      height: 16,
    },
    bottomLeft: {
      x: 0,
      y: 32,
      width: 14,
      height: 16,
    },
    sideLeft: {
      x: 0,
      y: 16,
      width: 14,
      height: 15,
    },
    sideRight: {
      x: 50,
      y: 16,
      width: 14,
      height: 15,
    },
    bottomRight: {
      x: 50,
      y: 32,
      width: 14,
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
