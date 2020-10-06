import { generateId } from "../utils/idGenerator";
import { Coordinates } from "../types/types";

interface StaticObjectProps extends Coordinates {
  img: HTMLImageElement;
  width: number;
  height: number;
  deviationX?: number;
  deviationY?: number;
}

export class StaticObject {
  private img: HTMLImageElement;
  private top: number;
  private left: number;
  private originalLeft: number;
  private originalTop: number;
  private width: number;
  private height: number;
  private deviationX: number;
  private deviationY: number;
  public id = generateId();

  constructor({
    img,
    top,
    left,
    width,
    height,
    deviationX,
    deviationY,
  }: StaticObjectProps) {
    this.img = img;
    this.top = top;
    this.left = left;
    this.originalLeft = left;
    this.originalTop = top;
    this.width = width;
    this.height = height;
    this.deviationX = deviationX || 0;
    this.deviationY = deviationY || 0;
  }

  public update({
    ctx,
    resizedWidth,
    resizedHeight,
  }: {
    ctx: CanvasRenderingContext2D;
    resizedWidth: number;
    resizedHeight: number;
  }) {
    this.updateToResizedPosition(resizedWidth, resizedHeight);
    this.draw(ctx);
  }

  private updateToResizedPosition(resizedWidth: number, resizedHeight: number) {
    if (resizedWidth !== this.width || resizedHeight !== this.height) {
      this.left = this.originalLeft * (resizedWidth / this.width);
      this.top = this.originalTop * (resizedHeight / this.height);
    }
  }

  private draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.img,
      0,
      0,
      this.img.naturalWidth,
      this.img.naturalHeight,
      this.left + this.deviationX,
      this.top + this.deviationY,
      this.img.naturalWidth,
      this.img.naturalHeight
    );
  }
}
