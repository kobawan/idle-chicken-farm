import { Gender, ChickenBreed } from "../../types/types";

export interface ChickenProps {
  name: string;
  gender: Gender;
  width: number;
  height: number;
  sprite: HTMLImageElement;
  originalWidth?: number;
  originalHeight?: number;
  id?: string;
  breed: ChickenBreed;
  top?: number;
  left?: number;
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
