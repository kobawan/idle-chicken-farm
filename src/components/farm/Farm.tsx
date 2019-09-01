import React, { useRef, useEffect, memo } from "react";
import styles from "./farm.module.scss";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { initFarm } from "../../utils/drawImages";

const RESIZE_BY = 2;

export const Farm: React.FC = memo(() => {
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

    initFarm(ctx, resizedWidth, resizedHeight);
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
});
