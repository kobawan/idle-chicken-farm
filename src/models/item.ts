import { generateId } from "../utils/idGenerator";
import { Coordinates } from "../types/types";
import { CanvasCoordinates } from "../utils/spriteCoordinates";

interface ItemProps extends Coordinates {
  sprite: HTMLImageElement;
  spriteCoordinates: CanvasCoordinates;
  width: number;
  height: number;
  deviationX?: number;
  deviationY?: number;
}

export class Item {
  private sprite: HTMLImageElement;
  private spriteCoordinates: CanvasCoordinates;
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
    sprite,
    spriteCoordinates,
    top,
    left,
    width,
    height,
    deviationX,
    deviationY,
  }: ItemProps) {
    this.sprite = sprite;
    this.spriteCoordinates = spriteCoordinates;
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
      this.sprite,
      this.spriteCoordinates.x,
      this.spriteCoordinates.y,
      this.spriteCoordinates.width,
      this.spriteCoordinates.height,
      this.left + this.deviationX,
      this.top + this.deviationY,
      this.spriteCoordinates.width,
      this.spriteCoordinates.height,
    );
  }
}
