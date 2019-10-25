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
import { Chicken, SavedChickenState } from "../models/chicken";
import { DynItems, ChickenBreed } from "../types/types";
import { getStorageKey, StorageKeys } from "./localStorage";
import { DrawProps } from "../types/types";

const DYNAMIC_CANVAS_FRAME_THROTTLE = 15;

type DrawDynamicObjectsProps = DynItems & DrawProps & { animationIdRef: React.MutableRefObject<number> };

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
  const loop = (timestamp: number) => {
    window.cancelAnimationFrame(animationIdRef.current);
    frameCount++;

    if(frameCount < DYNAMIC_CANVAS_FRAME_THROTTLE) {
      animationIdRef.current = window.requestAnimationFrame(loop);
      return;
    }
    frameCount = 0;
    ctx.clearRect(0, 0, resizedWidth, resizedHeight);

    chickens.forEach(chicken => chicken.update(ctx, timestamp));

    animationIdRef.current = window.requestAnimationFrame(loop)
  }

  loop(performance.now());
};
