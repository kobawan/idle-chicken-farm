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

const getObjects = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
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
      width,
      height,
      ctx,
      top: positions[i].top,
      left: positions[i].left,
    })
  })
}

const getChickens = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
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
    chickens.push(new Chicken({ ctx, width, height, imgs: images[0] }));
  }
  for(let i = 0; i < rand2; i++) {
    chickens.push(new Chicken({ ctx, width, height, imgs: images[1] }));
  }
  for(let i = 0; i < rand3; i++) {
    chickens.push(new Chicken({ ctx, width, height, imgs: images[2] }));
  }

  return chickens;
}

export const initFarm = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.clearRect(0, 0, width, height);

  let frameCount = 0;
  const objects = await getObjects(ctx, width, height);
  const chickens = await getChickens(ctx, width, height);

  const loop = () => {
    frameCount++;
    if(frameCount < 15) {
      window.requestAnimationFrame(loop);
      return;
    }
    frameCount = 0;

    ctx.clearRect(0, 0, width, height);

    objects.forEach(object => object.update());
    chickens.forEach(chicken => chicken.update());

    window.requestAnimationFrame(loop)
  }

  loop();
}
