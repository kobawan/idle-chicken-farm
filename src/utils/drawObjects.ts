import henHouse from "../sprites/hen-house.png";
import waterHole from "../sprites/water.png";
import { loadMultipleImages } from "./loadImages";
import { StaticObject } from "../models/staticObject";
import { StaticItems } from "../types/types";
import { DrawProps } from "../types/types";

type DrawStaticObjectsProps = StaticItems & DrawProps;

export const createObjects = async (width: number, height: number) => {
  const images = await loadMultipleImages([henHouse, waterHole]);
  const houseProps = {
    top: height * 0.2,
    left: width * 0.2,
    img: images[0],
  };
  const waterProps = {
    top: houseProps.top,
    left: houseProps.left,
    deviationX: 70,
    deviationY: 30,
    img: images[1],
  };

  return [houseProps, waterProps].map((props) => {
    return new StaticObject({ ...props, width, height });
  });
};

export const drawStaticObjects = ({
  canvasRef,
  objects,
  resizedWidth,
  resizedHeight,
}: DrawStaticObjectsProps) => {
  if (!canvasRef.current) {
    return;
  }
  const ctx = canvasRef.current.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, resizedWidth, resizedHeight);

  objects.forEach((object) => object.update({ ctx, resizedWidth, resizedHeight }));
};
