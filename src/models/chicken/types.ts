import { Gender, ChickenBreed } from "../../types/types";

export interface ChickenProps {
  name: string;
  gender: Gender;
  canvasWidth: number;
  canvasHeight: number;
  sprite: HTMLImageElement;
  id?: string;
  breed: ChickenBreed;
  top?: number;
  left?: number;
  hungerMeter?: number;
}

export enum ChickenState {
  eating = "eating",
  walkingToFood = "walkingToFood",
  wandering = "wandering",
  resting = "resting",
  searchingForFood = "searchingForFood",
}

export enum ChickenPose {
  default = "default",
  walking = "walking",
  resting = "resting",
}
