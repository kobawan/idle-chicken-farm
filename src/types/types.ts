import { Chicken } from "../utils/chicken";
import { StaticObject } from "../utils/staticObject";
import { Food } from "../utils/food";

export interface Coordinates {
  left: number;
  top: number;
}

export interface StaticItems {
  objects: StaticObject[];
  food: Food[];
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
