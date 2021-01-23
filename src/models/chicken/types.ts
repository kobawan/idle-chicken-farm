import { Gender, ChickenBreed } from "../../types/types";

export interface ChickenProps {
  name: string;
  gender: Gender;
  canvasWidth: number;
  canvasHeight: number;
  sprite: HTMLImageElement;
  id?: string;
  breed: ChickenBreed;
  topRatio?: number;
  leftRatio?: number;
  hungerMeter?: number;
}

export enum ChickenState {
  eating = "eating",
  walkingToFood = "walkingToFood",
  walking = "walking",
  resting = "resting",
}

export enum ChickenPose {
  default = "default",
  walking = "walking",
  resting = "resting",
}
