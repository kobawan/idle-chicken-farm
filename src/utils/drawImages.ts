import brownChicken1 from "../sprites/brown-chicken-1.png";
import brownChicken2 from "../sprites/brown-chicken-2.png";
import brownChicken3 from "../sprites/brown-chicken-3.png";
import orangeChicken1 from "../sprites/orange-chicken-1.png";
import orangeChicken2 from "../sprites/orange-chicken-2.png";
import orangeChicken3 from "../sprites/orange-chicken-3.png";
import yellowChicken1 from "../sprites/yellow-chicken-1.png";
import yellowChicken2 from "../sprites/yellow-chicken-2.png";
import yellowChicken3 from "../sprites/yellow-chicken-3.png";
import { loadMultipleImages } from "./loadImages";
import henHouse from "../sprites/hen-house.png";
import waterHole from "../sprites/water.png";
import { Chicken } from "./chicken";
import { StaticObject } from "./staticObject";
import { StaticItems, DynItems, ChickenBreed } from "../types/types";
import { getStorageKey, StorageKeys } from "./localStorage";

const FRAME_RATE = 15;

interface DrawStaticObjectsProps extends StaticItems {
  canvasStaticRef: React.RefObject<HTMLCanvasElement>,
  resizedWidth: number,
  resizedHeight: number,
}

interface DrawDynamicObjectsProps extends DynItems {
  canvasDynRef: React.RefObject<HTMLCanvasElement>,
  resizedWidth: number,
  resizedHeight: number,
  animationIdRef: React.MutableRefObject<number>
}

export const getObjects = async () => {
  const images = await loadMultipleImages([
    henHouse,
    waterHole,
  ]);
  const positions = [
    { top: 100, left: 100 },
    { top: 120, left: 170 },
  ]
  return images.map((img, i) => {
    return new StaticObject({
      img,
      top: positions[i].top,
      left: positions[i].left,
    })
  })
}

const createChicken = (
  width: number,
  height: number,
  imgs: HTMLImageElement[],
  breed: ChickenBreed,
  amount: number | null,
) => {
  const count = amount || Math.ceil(Math.random() * 15);
  const chickens: Chicken[] = [];

  for(let i = 0; i < count; i++) {
    chickens.push(new Chicken({ width, height, imgs, breed }));
  }
  return chickens;
}

export const getChickens = async (width: number, height: number) => {
  const images = await Promise.all([
    loadMultipleImages([brownChicken1, brownChicken2, brownChicken3]),
    loadMultipleImages([orangeChicken1, orangeChicken2, orangeChicken3]),
    loadMultipleImages([yellowChicken1, yellowChicken2, yellowChicken3]),
  ]);
  const total = getStorageKey(StorageKeys.chickens);

  return [
    ...createChicken(width, height, images[0], ChickenBreed.brown, total && total.brown),
    ...createChicken(width, height, images[1], ChickenBreed.orange, total && total.orange),
    ...createChicken(width, height, images[2], ChickenBreed.yellow, total && total.yellow),
  ];
}

export const drawStaticObjects = ({
  canvasStaticRef,
  objects,
  food,
  resizedWidth,
  resizedHeight,
}: DrawStaticObjectsProps) => {
  if(!canvasStaticRef.current || !objects.length) {
    return;
  }
  const ctx = canvasStaticRef.current.getContext('2d');
  if(!ctx) {
    return;
  }

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, resizedWidth, resizedHeight);

  objects.forEach(object => object.update(ctx));
  food.forEach(food => food.update(ctx));
}

export const drawDynamicObjects = ({
  canvasDynRef,
  resizedWidth,
  resizedHeight,
  chickens,
  animationIdRef,
}: DrawDynamicObjectsProps) => {
  if(!canvasDynRef.current || !chickens.length) {
    return;
  }
  const ctx = canvasDynRef.current.getContext('2d');
  if(!ctx) {
    return;
  }

  let frameCount = 0;
  ctx.imageSmoothingEnabled = false;
  window.cancelAnimationFrame(animationIdRef.current);
  const loop = () => {
    window.cancelAnimationFrame(animationIdRef.current);
    frameCount++;
    if(frameCount < FRAME_RATE) {
      animationIdRef.current = window.requestAnimationFrame(loop);
      return;
    }
    frameCount = 0;
    ctx.clearRect(0, 0, resizedWidth, resizedHeight);

    chickens.forEach(chicken => chicken.update(ctx));

    animationIdRef.current = window.requestAnimationFrame(loop)
  }

  loop();
};
