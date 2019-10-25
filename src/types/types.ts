import { Chicken } from "../models/chicken";
import { StaticObject } from "../models/staticObject";
import { Food } from "../models/food";

export interface Coordinates {
  left: number;
  top: number;
}

export interface StaticItems {
  objects: StaticObject[];
}

export interface FoodItems {
  food: Food[];
}

export interface DynItems {
  chickens: Chicken[];
}

export type FarmItems = StaticItems & DynItems & FoodItems;

export enum ChickenBreed {
  brown = "brown",
  orange = "orange",
  yellow = "yellow",
}

export type InteractEvent<E> = React.MouseEvent<E> | React.TouchEvent<E>;

export interface DrawProps {
  canvasRef: React.RefObject<HTMLCanvasElement>,
  resizedWidth: number,
  resizedHeight: number,
}
