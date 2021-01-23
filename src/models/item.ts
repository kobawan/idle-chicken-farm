import { generateId } from "../utils/math";
import { Coordinates } from "../types/types";
import { CanvasCoordinates } from "../utils/spriteCoordinates";
import { RESIZE_BY } from "../gameConfig";

interface ItemProps extends Coordinates {
  sprite: HTMLImageElement;
  spriteCoordinates: CanvasCoordinates;
  deviationX?: number;
  deviationY?: number;
}

export class Item {
  private sprite: HTMLImageElement;
  private spriteCoordinates: CanvasCoordinates;
  private top: number;
  private left: number;
  public id = generateId();

  constructor({ sprite, spriteCoordinates, top, left, deviationX = 0, deviationY = 0 }: ItemProps) {
    this.sprite = sprite;
    this.spriteCoordinates = spriteCoordinates;
    this.top = top + deviationY;
    this.left = left + deviationX;
  }

  public update({ ctx }: { ctx: CanvasRenderingContext2D }) {
    this.draw(ctx);
  }

  private draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.sprite,
      this.spriteCoordinates.x,
      this.spriteCoordinates.y,
      this.spriteCoordinates.width,
      this.spriteCoordinates.height,
      this.left,
      this.top,
      this.spriteCoordinates.width * RESIZE_BY,
      this.spriteCoordinates.height * RESIZE_BY,
    );
  }
}
