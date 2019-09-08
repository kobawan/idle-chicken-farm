import React, { useRef, useEffect } from "react";
import styles from "./dynamicCanvas.module.scss";
import { drawDynamicObjects } from "../../utils/drawImages";
import { Chicken } from "../../utils/chicken";

interface DynamicCanvasProps {
  resizedWidth: number;
  resizedHeight: number;
  chickens: Chicken[];
  toggleDragging: () => void;
  dropFood: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const DynamicCanvas: React.FC<DynamicCanvasProps> = ({
  resizedWidth,
  resizedHeight,
  chickens,
  toggleDragging,
  dropFood,
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
      onMouseDown={toggleDragging}
      onMouseUp={(e) => {
        dropFood(e);
        toggleDragging();
      }}
      onMouseMove={dropFood}
    ></canvas>
  );
};
