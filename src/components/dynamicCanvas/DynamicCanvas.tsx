import React, { useRef, useEffect, useCallback } from "react";
import styles from "./dynamicCanvas.module.scss";
import { drawDynamicObjects } from "../../utils/drawImages";
import { Chicken } from "../../models/chicken";
import { InteractEvent } from "../../types/types";

interface DynamicCanvasProps {
  resizedWidth: number;
  resizedHeight: number;
  chickens: Chicken[];
  toggleDragging: (e: InteractEvent<HTMLCanvasElement>) => void;
  dropFood: (e: InteractEvent<HTMLCanvasElement>) => void;
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
  const onDragFinished = useCallback((e: InteractEvent<HTMLCanvasElement>) => {
    dropFood(e);
    toggleDragging(e);
  }, [dropFood, toggleDragging]);

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
      onTouchStart={toggleDragging}
      onTouchEnd={onDragFinished}
      onTouchMove={dropFood}
      onMouseDown={toggleDragging}
      onMouseUp={onDragFinished}
      onMouseMove={dropFood}
    ></canvas>
  );
};
