import React, { useRef, useEffect } from "react";
import styles from "./staticCanvas.module.scss";
import { drawStaticObjects } from "../../utils/drawImages";
import { Food } from "../../utils/food";
import { StaticObject } from "../../utils/staticObject";

interface StaticCanvasProps {
  food: Food[];
  resizedWidth: number;
  resizedHeight: number;
  objects: StaticObject[];
}

export const StaticCanvas: React.FC<StaticCanvasProps> = ({
  resizedWidth,
  resizedHeight,
  objects,
  food,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawStaticObjects({
      canvasRef,
      resizedWidth,
      resizedHeight,
      objects,
      food,
    })
  }, [resizedWidth, resizedHeight, objects, food])

  return (
    <canvas
      ref={canvasRef}
      width={resizedWidth}
      height={resizedHeight}
      className={styles.canvas}
    ></canvas>
  );
};
