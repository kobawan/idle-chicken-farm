import { Chicken } from "../models/chicken";
import { StaticObject } from "../models/staticObject";
import { Food } from "../models/food";

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
