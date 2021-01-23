import React, { useRef, useEffect } from "react";
import styles from "./staticCanvas.module.scss";
import { drawItems } from "../../utils/drawItems";
import { StaticItems } from "../../types/types";

interface StaticCanvasProps extends StaticItems {
  canvasWidth: number;
  canvasHeight: number;
}

export const StaticCanvas: React.FC<StaticCanvasProps> = ({ canvasWidth, canvasHeight, items }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawItems({
      canvasRef,
      canvasWidth,
      canvasHeight,
      items,
    });
  }, [canvasWidth, canvasHeight, items]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className={styles.canvas}
    ></canvas>
  );
};
