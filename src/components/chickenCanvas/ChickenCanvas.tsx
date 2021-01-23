import React, { useRef, useEffect } from "react";
import styles from "./chickenCanvas.module.scss";
import { ChickenItems } from "../../types/types";
import { drawChickens } from "../../utils/drawChickens";
import { StorageKeys } from "../../utils/saveUtils/localStorage";
import { saveItemsOnInterval } from "../../utils/saveUtils/save";

interface ChickenCanvasProps extends ChickenItems {
  canvasWidth: number;
  canvasHeight: number;
}

export const ChickenCanvas: React.FC<ChickenCanvasProps> = ({
  canvasWidth,
  canvasHeight,
  chickens,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef(0);

  useEffect(() => {
    drawChickens({
      canvasRef,
      canvasWidth,
      canvasHeight,
      animationIdRef,
      chickens,
    });
  }, [canvasWidth, canvasHeight, animationIdRef, chickens]);
  useEffect(() => saveItemsOnInterval(StorageKeys.chickens, chickens), [
    chickens,
    canvasHeight,
    canvasWidth,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className={styles.canvas}
    ></canvas>
  );
};
