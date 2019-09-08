import { generateId } from "./idGenerator";
import { Coordinates } from "../types/types";

interface StaticObjectProps extends Coordinates {
  img: HTMLImageElement;
}

export class StaticObject {
  img: HTMLImageElement;
  top: number;
  left: number;
  public id = generateId();

  constructor({ img, top, left }: StaticObjectProps) {
    this.img = img;
    this.top = top;
    this.left = left;
  }

  public update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
  }

  private draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.img,
      0,
      0,
      this.img.naturalWidth,
      this.img.naturalHeight,
      this.left,
      this.top,
      this.img.naturalWidth,
      this.img.naturalHeight
    );
  }
}
