import React, { useRef, useEffect } from "react";
import styles from "./dynamicCanvas.module.scss";
import { drawDynamicObjects } from "../../utils/drawChickens";
import { DynItems } from "../../types/types";

interface DynamicCanvasProps extends DynItems {
  resizedWidth: number;
  resizedHeight: number;
}

export const DynamicCanvas: React.FC<DynamicCanvasProps> = ({
  resizedWidth,
  resizedHeight,
  chickens,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef(0);

  useEffect(() => {
    drawDynamicObjects({
      canvasRef,
      resizedWidth,
      resizedHeight,
      animationIdRef,
      chickens,
    })
  }, [resizedWidth, resizedHeight, animationIdRef, chickens]);

  return (
    <canvas
      ref={canvasRef}
      width={resizedWidth}
      height={resizedHeight}
      className={styles.canvas}
    ></canvas>
  );
};
