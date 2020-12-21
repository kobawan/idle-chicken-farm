import React, { useRef, useEffect } from "react";
import styles from "./chickenCanvas.module.scss";
import { ChickenItems } from "../../types/types";
import { drawChickens } from "../../utils/drawChickens";
import { StorageKeys } from "../../utils/localStorage";
import { saveItemsOnInterval } from "../../utils/save";

interface ChickenCanvasProps extends ChickenItems {
  resizedWidth: number;
  resizedHeight: number;
}

export const ChickenCanvas: React.FC<ChickenCanvasProps> = ({
  resizedWidth,
  resizedHeight,
  chickens,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef(0);

  useEffect(() => {
    drawChickens({
      canvasRef,
      resizedWidth,
      resizedHeight,
      animationIdRef,
      chickens,
    });
  }, [resizedWidth, resizedHeight, animationIdRef, chickens]);
  useEffect(() => saveItemsOnInterval(StorageKeys.chickens, chickens), [
    chickens,
    resizedHeight,
    resizedWidth,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={resizedWidth}
      height={resizedHeight}
      className={styles.canvas}
    ></canvas>
  );
};
