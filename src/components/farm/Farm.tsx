import React, { useRef, useEffect, memo, useState, useCallback } from "react";
import throttle from "lodash.throttle";
import cx from "classnames";
import styles from "./farm.module.scss";
import { useWindowDimensions } from "../../utils/useWindowDimensions";
import { getObjects, getChickens, drawStaticObjects, drawDynObjects } from "../../utils/drawImages";
import foodUrl from "../../sprites/food1.png";
import { StaticObject } from "../../utils/staticObject";
import { loadImage } from "../../utils/loadImages";
import { Chicken } from "../../utils/chicken";

const RESIZE_BY = 2;

const addFoodItem = throttle(({
  food,
  foodImg,
  x,
  y,
  setFood,
}) => {
  setFood([
    ...food,
    new StaticObject({
      img: foodImg!,
      top: Math.round(y / RESIZE_BY),
      left: Math.round(x / RESIZE_BY),
    }),
  ])
}, 100);

export const Farm: React.FC = memo(() => {
  const canvasStaticRef = useRef<HTMLCanvasElement>(null);
  const canvasDynRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useWindowDimensions();
  const resizedWidth = width / RESIZE_BY;
  const resizedHeight = height / RESIZE_BY;
  const [objects, setObjects] = useState<StaticObject[]>([]);
  const [chickens, setChickens] = useState<Chicken[]>([]);
  const [food, setFood] = useState<StaticObject[]>([]);
  const [isFeeding, setIsFeeding] = useState(false);
  const [foodImg, setFoodImg] = useState<HTMLImageElement | undefined>(undefined);
  const [canDropFood, setCanDropFood] = useState(false);
  const animationIdRef = useRef(0);

  useEffect(() => {
    const stopFeedingOnEsc = (e: KeyboardEvent) => {
      if (e.code === "Escape" && isFeeding) {
        setIsFeeding(!isFeeding);
      }
    };
    document.addEventListener("keydown", stopFeedingOnEsc);

    return () => {
      document.removeEventListener("keydown", stopFeedingOnEsc);
    };
  }, [isFeeding]);

  /**
   * @todo do not regenerate chickens!
   */
  useEffect(() => {
    Promise.all([
      getObjects(),
      getChickens(resizedWidth, resizedHeight),
      loadImage(foodUrl),
    ]).then(([objects, chickens, foodImg]) => {
      setObjects(objects);
      setChickens(chickens);
      setFoodImg(foodImg);
    });
    // eslint-disable-next-line
  }, [resizedWidth, resizedHeight]);

  useEffect(() => {
    drawStaticObjects({
      canvasStaticRef,
      resizedWidth,
      resizedHeight,
      objects,
      food,
    })
  }, [canvasStaticRef, resizedWidth, resizedHeight, objects, food]);

  useEffect(() => {
    drawDynObjects({
      canvasDynRef,
      resizedWidth,
      resizedHeight,
      animationIdRef,
      chickens,
    })
  }, [canvasDynRef, resizedWidth, resizedHeight, chickens]);

  const toggleFeeding = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsFeeding(!isFeeding);
  }

  const handleFoodAdd = useCallback((e) => {
    e.persist();
    if (!isFeeding || !foodImg || !canDropFood) {
      return;
    }

    addFoodItem({
      x: e.clientX,
      y: e.clientY,
      food,
      foodImg,
      setFood,
    });
  }, [isFeeding, foodImg, canDropFood, food]);

  return (
    <div className={cx(styles.wrapper, isFeeding && styles.feeding)}>
      <div className={styles.bg}/>
      <canvas
        ref={canvasStaticRef}
        width={resizedWidth}
        height={resizedHeight}
        className={styles.canvas}
      ></canvas>
      <canvas
        ref={canvasDynRef}
        width={resizedWidth}
        height={resizedHeight}
        className={styles.canvas}
        onMouseDown={() => setCanDropFood(true)}
        onMouseUp={(e) => {
          handleFoodAdd(e);
          setCanDropFood(false);
        }}
        onMouseMove={handleFoodAdd}
      ></canvas>
      <div className={styles.toolBar}>
        <button className={styles.farmButton} onClick={toggleFeeding}>
          <img src={foodUrl} alt="food"></img>
        </button>
      </div>
    </div>
  );
});
