import { Chicken } from "../models/chicken/Chicken";
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

export interface ChickenItems {
  chickens: Chicken[];
}

export type FarmItems = StaticItems & ChickenItems & FoodItems;

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

export type Gender = 'female' | 'male';

export type ChickenNames = Record<Gender, string[]>;
