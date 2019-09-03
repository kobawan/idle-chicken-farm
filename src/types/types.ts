import { Chicken } from "../utils/chicken";
import { StaticObject } from "../utils/staticObject";

export interface Coordinates {
  left: number;
  top: number;
}

export interface StaticItems {
  objects: StaticObject[];
  food: StaticObject[];
}

export interface DynItems {
  chickens: Chicken[];
}

export type FarmItems = StaticItems & DynItems;

export enum ChickenBreed {
  brown = "brown",
  orange = "orange",
  yellow = "yellow",
}
