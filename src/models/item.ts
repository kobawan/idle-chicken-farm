import { generateId } from "../utils/math";
import { Coordinates } from "../types/types";
import { CanvasCoordinates } from "../utils/spriteCoordinates";
import { RESIZE_BY } from "../gameConfig";

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
    canvasWidth,
    canvasHeight,
  }: {
    ctx: CanvasRenderingContext2D;
    canvasWidth: number;
    canvasHeight: number;
  }) {
    this.updateToResizedPosition(canvasWidth, canvasHeight);
    this.draw(ctx);
  }

  private updateToResizedPosition(canvasWidth: number, canvasHeight: number) {
    if (canvasWidth !== this.width || canvasHeight !== this.height) {
      this.left = this.originalLeft * (canvasWidth / this.width);
      this.top = this.originalTop * (canvasHeight / this.height);
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
      this.spriteCoordinates.width * RESIZE_BY,
      this.spriteCoordinates.height * RESIZE_BY,
    );
  }
}
