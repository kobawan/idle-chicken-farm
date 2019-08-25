import React, { useRef, useEffect } from "react";
import styles from "./farm.module.scss";
import henHouse from "../../sprites/hen-house.png";
import waterHole from "../../sprites/water.png";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { drawImage, drawAllChickens } from "../../utils/drawImages";

const RESIZE_BY = 2;

export const Farm: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useWindowDimensions();
  const resizedWidth = width / RESIZE_BY;
  const resizedHeight = height / RESIZE_BY;

  useEffect(() => {
    if(!canvasRef.current) {
      return;
    }
    const ctx = canvasRef.current.getContext('2d');
    if(!ctx) {
      return;
    }

    drawImage({ ctx, src: henHouse, top: 100, left: 100 });
    drawImage({ ctx, src: waterHole, top: 120, left: 170 });

    drawAllChickens(ctx, resizedWidth, resizedHeight);
  }, [canvasRef, resizedWidth, resizedHeight])

  return (
    <div className={styles.wrapper}>
      <canvas
        ref={canvasRef}
        width={resizedWidth}
        height={resizedHeight}
        className={styles.canvas}
      ></canvas>
    </div>
  );
}