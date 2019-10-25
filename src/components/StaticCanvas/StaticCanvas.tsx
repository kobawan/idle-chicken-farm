import React, { useRef, useEffect } from "react";
import styles from "./staticCanvas.module.scss";
import { drawStaticObjects } from "../../utils/drawObjects";
import { StaticItems } from "../../types/types";

interface StaticCanvasProps extends StaticItems {
  resizedWidth: number;
  resizedHeight: number;
}

export const StaticCanvas: React.FC<StaticCanvasProps> = ({
  resizedWidth,
  resizedHeight,
  objects,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawStaticObjects({
      canvasRef,
      resizedWidth,
      resizedHeight,
      objects,
    });
  }, [resizedWidth, resizedHeight, objects])

  return (
    <canvas
      ref={canvasRef}
      width={resizedWidth}
      height={resizedHeight}
      className={styles.canvas}
    ></canvas>
  );
};
