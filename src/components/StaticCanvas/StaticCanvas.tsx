import React, { useRef, useEffect } from "react";
import styles from "./staticCanvas.module.scss";
import { drawItems } from "../../utils/drawItems";
import { StaticItems } from "../../types/types";

interface StaticCanvasProps extends StaticItems {
  resizedWidth: number;
  resizedHeight: number;
}

export const StaticCanvas: React.FC<StaticCanvasProps> = ({
  resizedWidth,
  resizedHeight,
  items,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawItems({
      canvasRef,
      resizedWidth,
      resizedHeight,
      items,
    });
  }, [resizedWidth, resizedHeight, items]);

  return (
    <canvas
      ref={canvasRef}
      width={resizedWidth}
      height={resizedHeight}
      className={styles.canvas}
    ></canvas>
  );
};
