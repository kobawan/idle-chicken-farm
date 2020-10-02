import { Gender, ChickenBreed } from "../../types/types";

export interface ChickenProps {
  imgs: HTMLImageElement[];
  name: string;
  gender: Gender;
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
  id?: string;
  breed: ChickenBreed;
  top?: number;
  left?: number;
  hungerMeter?: number;
}

export type SavedChickenState = Required<Pick<
  ChickenProps,
  "breed"|"id"|"top"|"left"|"hungerMeter"|"originalHeight"|"originalWidth"|"gender"|"name">
>;

export enum ChickenState {
  eating,
  walkingToFood,
  walking,
  resting,
}

export enum ChickenImage {
  default = 'default',
  walking = 'walking',
  resting = 'resting',
}
