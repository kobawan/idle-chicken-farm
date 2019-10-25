import React, { useRef, useEffect, useCallback } from "react";
import styles from "./foodCanvas.module.scss";
import { drawFoodObjects } from "../../utils/drawFood";
import { InteractEvent, FoodItems } from "../../types/types";

interface FoodCanvasProps extends FoodItems {
  resizedWidth: number;
  resizedHeight: number;
  toggleDragging: (e: InteractEvent<HTMLCanvasElement>) => void;
  dropFood: (e: InteractEvent<HTMLCanvasElement>) => void;
  isDraggingFood: boolean;
}

export const FoodCanvas: React.FC<FoodCanvasProps> = ({
  resizedWidth,
  resizedHeight,
  food,
  toggleDragging,
  dropFood,
  isDraggingFood,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef(0);
  const onDragFinished = useCallback((e: InteractEvent<HTMLCanvasElement>) => {
    dropFood(e);
    toggleDragging(e);
  }, [dropFood, toggleDragging]);

  useEffect(() => {
    drawFoodObjects({
      canvasRef,
      resizedWidth,
      resizedHeight,
      animationIdRef,
      food,
      isDraggingFood,
    })
  }, [resizedWidth, resizedHeight, food, isDraggingFood]);

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
