import brownChicken1 from "../sprites/brown-chicken-1.png";
import brownChicken2 from "../sprites/brown-chicken-2.png";
import brownChicken3 from "../sprites/brown-chicken-3.png";
import orangeChicken1 from "../sprites/orange-chicken-1.png";
import orangeChicken2 from "../sprites/orange-chicken-2.png";
import orangeChicken3 from "../sprites/orange-chicken-3.png";
import yellowChicken1 from "../sprites/yellow-chicken-1.png";
import yellowChicken2 from "../sprites/yellow-chicken-2.png";
import yellowChicken3 from "../sprites/yellow-chicken-3.png";
import food1 from "../sprites/food1.png";
import food2 from "../sprites/food2.png";
import food3 from "../sprites/food3.png";
import { loadMultipleImages } from "./loadImages";
import henHouse from "../sprites/hen-house.png";
import waterHole from "../sprites/water.png";
import { Chicken, SavedChickenState } from "./chicken";
import { StaticObject } from "./staticObject";
import { StaticItems, DynItems, ChickenBreed, Coordinates } from "../types/types";
import { getStorageKey, StorageKeys } from "./localStorage";
import { Food, SavedFoodState } from "./food";

const FRAME_THROTTLE = 15;

interface DrawProps {
  canvasRef: React.RefObject<HTMLCanvasElement>,
  resizedWidth: number,
  resizedHeight: number,
}

type DrawStaticObjectsProps = StaticItems & DrawProps;
type DrawDynamicObjectsProps = DynItems & DrawProps & { animationIdRef: React.MutableRefObject<number> };

export const getFoodImgs = async () => {
  return await loadMultipleImages([
    food1,
    food2,
    food3,
  ]);
}

export const getFood = (imgs: HTMLImageElement[]) => {
  const savedFood = getStorageKey(StorageKeys.food);
  if(!savedFood) {
    return [];
  }

  return savedFood.map((food: SavedFoodState) => new Food({ ...food, imgs }));
};

export const getObjects = async () => {
  const images = await loadMultipleImages([
    henHouse,
    waterHole,
  ]);
  const positions: Coordinates[] = [
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
  const images = await Promise.all([
    loadMultipleImages([brownChicken1, brownChicken2, brownChicken3]),
    loadMultipleImages([orangeChicken1, orangeChicken2, orangeChicken3]),
    loadMultipleImages([yellowChicken1, yellowChicken2, yellowChicken3]),
  ]);
  const imagesBreedMap = {
    [ChickenBreed.brown]: images[0],
    [ChickenBreed.orange]: images[1],
    [ChickenBreed.yellow]: images[2],
  }
  const savedChickens = getStorageKey(StorageKeys.chickens);
  if(!savedChickens) {
    return Object.keys(ChickenBreed).map(breed => new Chicken({
      width,
      height,
      imgs: imagesBreedMap[breed as ChickenBreed],
      breed: breed as ChickenBreed,
    }))
  }

  return savedChickens.map((props: SavedChickenState) => new Chicken({
    width,
    height,
    imgs: imagesBreedMap[props.breed],
    ...props,
  }));
}

export const drawStaticObjects = ({
  canvasRef,
  objects,
  food,
  resizedWidth,
  resizedHeight,
}: DrawStaticObjectsProps) => {
  if(!canvasRef.current) {
    return;
  }
  const ctx = canvasRef.current.getContext('2d');
  if(!ctx) {
    return;
  }

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, resizedWidth, resizedHeight);

  objects.forEach(object => object.update(ctx));
  food.forEach(food => food.update(ctx));
}

export const drawDynamicObjects = ({
  canvasRef,
  resizedWidth,
  resizedHeight,
  chickens,
  animationIdRef,
}: DrawDynamicObjectsProps) => {
  if(!canvasRef.current) {
    return;
  }
  const ctx = canvasRef.current.getContext('2d');
  if(!ctx) {
    return;
  }

  let frameCount = 0;
  ctx.imageSmoothingEnabled = false;
  window.cancelAnimationFrame(animationIdRef.current);
  const loop = () => {
    window.cancelAnimationFrame(animationIdRef.current);
    frameCount++;

    if(frameCount < FRAME_THROTTLE) {
      animationIdRef.current = window.requestAnimationFrame(loop);
      return;
    }
    frameCount = 0;
    ctx.clearRect(0, 0, resizedWidth, resizedHeight);

    chickens.forEach(chicken => {
      chicken.update(ctx);
    });

    animationIdRef.current = window.requestAnimationFrame(loop)
  }

  loop();
};
