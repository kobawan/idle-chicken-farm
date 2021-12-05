import React from "react";
import { Chicken } from "../models/chicken/chicken";
import { Food } from "../models/food";

export interface Coordinates {
  left: number;
  top: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Boundary {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export enum Direction {
  left = "left",
  right = "right",
}

export interface FoodItems {
  food: Food[];
}

export interface ChickenItems {
  chickens: Chicken[];
}

export type FarmItems = ChickenItems & FoodItems;

export enum ChickenBreed {
  lightbrown = "light-brown",
  brown = "dark-brown",
  orange = "orange",
  white = "white",
}

export type InteractEvent<E> = React.MouseEvent<E> | React.TouchEvent<E>;

export interface DrawProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasWidth: number;
  canvasHeight: number;
}

export type Gender = "female" | "male";

export type ChickenNames = Record<Gender, string[]>;
