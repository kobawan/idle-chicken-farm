import { Item } from "../models/item";
import { StaticItems } from "../types/types";
import { DrawProps } from "../types/types";
import { spriteCoordinatesMap } from "./spriteCoordinates";

type DrawItemsProps = StaticItems & DrawProps;

export const createItems = async (width: number, height: number, sprite: HTMLImageElement) => {
  const houseProps = {
    top: height * 0.2,
    left: width * 0.2,
    spriteCoordinates: spriteCoordinatesMap.coop,
  };
  const waterProps = {
    top: houseProps.top,
    left: houseProps.left,
    deviationX: 70,
    deviationY: 30,
    spriteCoordinates: spriteCoordinatesMap.trough,
  };

  return [houseProps, waterProps].map((props) => {
    return new Item({ ...props, width, height, sprite });
  });
};

export const drawItems = ({ canvasRef, items, resizedWidth, resizedHeight }: DrawItemsProps) => {
  if (!canvasRef.current) {
    return;
  }
  const ctx = canvasRef.current.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, resizedWidth, resizedHeight);

  items.forEach((item) => item.update({ ctx, resizedWidth, resizedHeight }));
};
