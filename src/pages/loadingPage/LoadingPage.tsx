import React, { useEffect, useRef, useState } from "react";
import cx from "classnames";
import styles from "./loadingPage.module.scss";
import chickenUrl from "../../assets/chicken.png";
import chickenWalkingUrl from "../../assets/chicken_walking.png";
import { loadMultipleImages } from "../../utils/loadImages";
import { LOADING_PAGE_MIN_MS, RESIZE_BY } from "../../gameConfig";

const IMG_WIDTH = 15;
const IMG_HEIGHT = 17;
const FADING_MS = 1000;

interface LoadingPageProps {
  shouldStartFading: boolean;
  stopFading: () => void;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ shouldStartFading, stopFading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dots, setDots] = useState("");
  const [animationIndex, setAnimationIndex] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const startLoadTime = useRef(performance.now());

  useEffect(() => {
    loadMultipleImages([chickenUrl, chickenWalkingUrl])
      .then((imgs) => {
        setImages(imgs);
      })
      .catch();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setDots(dots.length === 3 ? "" : dots + ".");

      if (images) {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          const newAnimationIndex = animationIndex ? 0 : 1;
          setAnimationIndex(newAnimationIndex);
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, IMG_WIDTH * RESIZE_BY, IMG_HEIGHT * RESIZE_BY);
          ctx.drawImage(
            images[newAnimationIndex],
            0,
            0,
            IMG_WIDTH,
            IMG_HEIGHT,
            0,
            0,
            IMG_WIDTH * RESIZE_BY,
            IMG_HEIGHT * RESIZE_BY,
          );
        }
      }
    }, 500);
    return () => clearInterval(id);
  }, [dots, animationIndex, images]);

  const hasFinishedMinLoadTime = performance.now() - startLoadTime.current >= LOADING_PAGE_MIN_MS;
  const startFading = shouldStartFading && hasFinishedMinLoadTime;
  useEffect(() => {
    if (startFading) {
      setTimeout(() => stopFading(), FADING_MS);
    }
  }, [startFading, stopFading]);

  return (
    <>
      <div className={cx(styles.container, startFading && styles.startFading)}>
        <h1>Loading{dots}</h1>
        <canvas
          ref={canvasRef}
          width={`${IMG_WIDTH * RESIZE_BY}px`}
          height={`${IMG_HEIGHT * RESIZE_BY}px`}
        ></canvas>
      </div>
    </>
  );
};
