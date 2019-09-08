import { generateId } from "./idGenerator";

interface StaticObjectProps {
  img: HTMLImageElement;
  top: number;
  left: number;
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
