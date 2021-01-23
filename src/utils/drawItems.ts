import { Item } from "../models/item";
import { StaticItems } from "../types/types";
import { DrawProps } from "../types/types";
import { getWholeFenceProps } from "./fenceUtils";
import { spriteCoordinatesMap } from "./spriteCoordinates";

type DrawItemsProps = StaticItems & DrawProps;

export const getCoopProps = (width: number, height: number) => {
  return {
    top: height * 0.2,
    left: width * 0.2,
    spriteCoordinates: spriteCoordinatesMap.coop,
  };
};

export const getTroughProps = (width: number, height: number) => {
  return {
    top: height * 0.2,
    left: width * 0.2,
    deviationX: 140,
    deviationY: 60,
    spriteCoordinates: spriteCoordinatesMap.trough,
  };
};

export const getItems = (width: number, height: number, sprite: HTMLImageElement) => {
  const items = [
    getCoopProps(width, height),
    getTroughProps(width, height),
    ...getWholeFenceProps(width, height),
  ];

  return items.map((props) => {
    return new Item({ ...props, width, height, sprite });
  });
};

export const drawItems = ({ canvasRef, items, canvasWidth, canvasHeight }: DrawItemsProps) => {
  if (!canvasRef.current) {
    return;
  }
  const ctx = canvasRef.current.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  items.forEach((item) => item.update({ ctx, canvasWidth, canvasHeight }));
};
