import { loadMultipleImages, loadImage } from "./loadImages";
import brownChicken1 from "../sprites/brown-chicken-1.png";
import brownChicken2 from "../sprites/brown-chicken-2.png";
import brownChicken3 from "../sprites/brown-chicken-3.png";
import orangeChicken1 from "../sprites/orange-chicken-1.png";
import orangeChicken2 from "../sprites/orange-chicken-2.png";
import orangeChicken3 from "../sprites/orange-chicken-3.png";
import yellowChicken1 from "../sprites/yellow-chicken-1.png";
import yellowChicken2 from "../sprites/yellow-chicken-2.png";
import yellowChicken3 from "../sprites/yellow-chicken-3.png";

const MOVEMENT_PX = 2;

interface DrawImageOptionsCommon {
  ctx: CanvasRenderingContext2D;
  top: number;
  left: number;
}

interface DrawImageOptions extends DrawImageOptionsCommon {
  src: string;
}

interface DrawImagesOptions {
  srcs: string[];
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D
}

interface DrawFromCoordinatesOptions extends DrawImageOptionsCommon {
  img: HTMLImageElement;
}

interface GetUpdatedPosOptions {
  top: number;
  left: number;
  maxWidth: number;
  maxHeight: number;
  imgWidth: number;
  imgHeight: number;
}

const drawFromCoordinates = ({
  top,
  left,
  ctx,
  img,
}: DrawFromCoordinatesOptions) => {
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;
  ctx.drawImage(
    img,
    0,
    0,
    img.naturalWidth,
    img.naturalHeight,
    left,
    top,
    imgWidth,
    imgHeight
  );
}

export const drawImage = ({ src, ...props }: DrawImageOptions) => {
  loadImage(src).then(img => {
    if(!img) {
      return;
    }
    props.ctx.clearRect( props.left, props.top, img.naturalWidth, img.naturalHeight);
    drawFromCoordinates({ ...props, img });
  })
}

const getUpdatedPos = ({
  imgWidth,
  imgHeight,
  top,
  left,
  maxWidth,
  maxHeight,
}: GetUpdatedPosOptions) => {
  const rand = Math.round(Math.random() * 3);
  let posTop = top;
  let posLeft = left;
  
  switch(rand) {
    case 0:
      posTop = Math.max(top - MOVEMENT_PX, 0);
      break;
    case 1:
      posLeft = Math.min(left + MOVEMENT_PX, maxWidth - imgWidth);
      break;
    case 2:
      posTop = Math.min(top + MOVEMENT_PX, maxHeight - imgHeight);
      break;
    case 3:
      posLeft = Math.max(left - MOVEMENT_PX, 0);
      break;
    default:
      console.error("Update position random number out of bounds");
      break
  }

  return { posTop, posLeft };
}

const drawChicken = ({
  srcs,
  width,
  height,
  ctx,
}: DrawImagesOptions) => {
  loadMultipleImages(srcs).then(imgs => {
    let i = 0;
    let frameCount = 0;
    let top = Math.round(Math.random() * (height - imgs[0].naturalHeight));
    let left = Math.round(Math.random() * (width - imgs[0].naturalWidth));

    const walk = () => {
      frameCount++;
      if(frameCount < 15) {
        window.requestAnimationFrame(walk);
        return;
      }
      frameCount = 0;
      const img = imgs[i];

      ctx.clearRect(
        left,
        top,
        (img.naturalWidth) + MOVEMENT_PX,
        (img.naturalHeight) + MOVEMENT_PX,
      );

      const res = getUpdatedPos({
        top,
        left,
        maxWidth: width,
        maxHeight: height,
        imgHeight: img.naturalHeight,
        imgWidth: img.naturalWidth
      });
      top = res.posTop;
      left = res.posLeft;

      drawFromCoordinates({ top, left, img, ctx });
      i = i + 1 >= imgs.length - 1 ? 0 : i + 1;

      window.requestAnimationFrame(walk);
    }
    walk();
  })
}

export const drawAllChickens = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const rand1 = Math.ceil(Math.random() * 15);
  const rand2 = Math.ceil(Math.random() * 15);
  const rand3 = Math.ceil(Math.random() * 15);
  for(let i = 0; i < rand1; i++) {
    drawChicken({
      ctx,
      width,
      height,
      srcs: [brownChicken1, brownChicken2, brownChicken3],
    });
  }
  for(let i = 0; i < rand2; i++) {
    drawChicken({
      ctx,
      width,
      height,
      srcs: [orangeChicken1, orangeChicken2, orangeChicken3],
    });
  }
  for(let i = 0; i < rand3; i++) {
    drawChicken({
      ctx,
      width,
      height,
      srcs: [yellowChicken1, yellowChicken2, yellowChicken3],
    });
  }
}
