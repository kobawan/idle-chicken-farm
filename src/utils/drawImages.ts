import { loadMultipleImages, loadImage } from "./loadImages";

interface ImageCoordinates {
  top: number;
  left: number;
}

interface DrawImageOptionsCommon extends ImageCoordinates {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}

interface DrawImageOptions extends DrawImageOptionsCommon {
  src: string;
}

interface DrawImagesOptions extends DrawImageOptionsCommon {
  srcs: string[];
}

type GetPosFromWindowOptions = Omit<DrawImageOptionsCommon, "ctx">;
type DrawFromCoordinates = DrawImageOptionsCommon & { img: HTMLImageElement };

const getPosFromWindow = ({ width, height, top, left }: GetPosFromWindowOptions) => {
  return {
    dy: Math.floor(height * (top / 100)),
    dx: Math.floor(width * (left / 100)),
  }
}

const drawFromCoordinates = ({
  top,
  left,
  width,
  height,
  ctx,
  img,
}: DrawFromCoordinates) => {
  const { dx, dy } = getPosFromWindow({ width, height, top, left });
  ctx.clearRect(dx, dy, img.naturalWidth, img.naturalHeight);
  ctx.drawImage(
    img,
    0,
    0,
    img.naturalWidth,
    img.naturalHeight,
    dx,
    dy,
    img.naturalWidth,
    img.naturalHeight
  );
}

export const drawImage = ({ src, ...props }: DrawImageOptions) => {
  loadImage(src).then(img => {
    if(!img) {
      return;
    }
    drawFromCoordinates({ ...props, img });
  })
}

export const drawChicken = ({
  srcs,
  ...props
}: DrawImagesOptions) => {
  loadMultipleImages(srcs).then(imgs => {
    let i = 0;
    let frameCount = 0;
    const walk = () => {
      frameCount++;
      if(frameCount < 15) {
        window.requestAnimationFrame(walk);
        return;
      }
      frameCount = 0;
      const img = imgs[i];

      drawFromCoordinates({ ...props, img });
      i = i + 1 >= imgs.length - 1 ? 0 : i + 1;

      window.requestAnimationFrame(walk);
    }
    walk();
  })
}
