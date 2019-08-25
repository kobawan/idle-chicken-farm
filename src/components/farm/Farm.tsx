import React, { useRef, useEffect } from "react";
import styles from "./farm.module.scss";
import henHouse from "../../sprites/hen-house.png";
import waterHole from "../../sprites/water.png";
import brownChicken1 from "../../sprites/brown-chicken-1.png";
import brownChicken2 from "../../sprites/brown-chicken-2.png";
import brownChicken3 from "../../sprites/brown-chicken-3.png";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { drawImage, drawChicken } from "../../utils/drawImages";

export const Farm: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if(!canvasRef.current) {
      return;
    }
    const ctx = canvasRef.current.getContext('2d');
    if(!ctx) {
      return;
    }

    drawImage({ ctx, width, height, src: henHouse, top: 20, left: 20 });
    drawImage({ ctx, width, height, src: waterHole, top: 20, left: 30 });

    drawChicken({
      ctx,
      width,
      height,
      srcs: [brownChicken1, brownChicken2, brownChicken3],
      top: 40,
      left: 20
    });
  }, [canvasRef, width, height])

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} width={width} height={height}></canvas>
    </div>
  );
}