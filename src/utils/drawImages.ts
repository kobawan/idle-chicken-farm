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

const FRAME_RATE = 15;

interface StaticItems {
  objects: StaticObject[];
  food: StaticObject[];
}

interface DynItems {
  chickens: Chicken[];
}

export type FarmItems = StaticItems & DynItems;

interface DrawStaticObjectsProps extends StaticItems {
  canvasStaticRef: React.RefObject<HTMLCanvasElement>,
  resizedWidth: number,
  resizedHeight: number,
}

interface DrawDynObjectsProps extends DynItems {
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

export const getChickens = async (width: number, height: number) => {
  const rand1 = Math.ceil(Math.random() * 15);
  const rand2 = Math.ceil(Math.random() * 15);
  const rand3 = Math.ceil(Math.random() * 15);
  const chickens: Chicken[] = [];

  const images = await Promise.all([
    loadMultipleImages([brownChicken1, brownChicken2, brownChicken3]),
    loadMultipleImages([orangeChicken1, orangeChicken2, orangeChicken3]),
    loadMultipleImages([yellowChicken1, yellowChicken2, yellowChicken3]),
  ]);

  for(let i = 0; i < rand1; i++) {
    chickens.push(new Chicken({ width, height, imgs: images[0] }));
  }
  for(let i = 0; i < rand2; i++) {
    chickens.push(new Chicken({ width, height, imgs: images[1] }));
  }
  for(let i = 0; i < rand3; i++) {
    chickens.push(new Chicken({ width, height, imgs: images[2] }));
  }

  return chickens;
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

export const drawDynObjects = ({
  canvasDynRef,
  resizedWidth,
  resizedHeight,
  chickens,
  animationIdRef,
}: DrawDynObjectsProps) => {
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
