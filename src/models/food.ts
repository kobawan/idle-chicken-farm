import { generateId } from "../utils/idGenerator";
import { Coordinates } from "../types/types";
import { CustomEventEmitter } from "../utils/EventEmitter";
import { EventName } from "../utils/events";
import { SavedFoodStateV2 } from "../utils/migrateSaves";
import { CanvasCoordinates, spriteCoordinatesMap } from "../utils/spriteCoordinates";
import { RESIZE_BY } from "../gameConsts";

const MAX_EATERS = 3;
const MAX_FOOD = 30;

export interface FoodProps extends Coordinates {
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
  sprite: HTMLImageElement;
  id?: string;
  foodMeter?: number;
}

export class Food {
  private originalWidth: number;
  private originalHeight: number;
  private width: number;
  private height: number;
  private sprite: HTMLImageElement;
  private foodMeter: number;
  private animalsEating: string[] = [];
  private originalTop: number;
  private originalLeft: number;
  public top: number;
  public left: number;
  public id: string;

  constructor({
    sprite,
    top,
    left,
    foodMeter,
    id,
    width,
    height,
    originalHeight,
    originalWidth,
  }: FoodProps) {
    this.sprite = sprite;
    this.originalWidth = originalWidth || width;
    this.originalHeight = originalHeight || height;
    this.width = width;
    this.height = height;
    this.originalTop = top;
    this.originalLeft = left;
    this.top = top * (height / this.originalHeight);
    this.left = left * (width / this.originalWidth);
    this.foodMeter = foodMeter ?? MAX_FOOD;
    this.id = id || generateId();
  }

  public update({
    ctx,
    resizedHeight,
    resizedWidth,
  }: {
    ctx: CanvasRenderingContext2D;
    resizedWidth: number;
    resizedHeight: number;
  }) {
    this.updateToResizedPosition(resizedWidth, resizedHeight);
    this.draw(ctx);
  }

  public getSavingState(): SavedFoodStateV2 {
    return {
      top: this.originalTop,
      left: this.originalLeft,
      foodMeter: this.foodMeter,
      id: this.id,
      originalHeight: this.originalHeight,
      originalWidth: this.originalWidth,
    };
  }

  public updateFoodMeter() {
    this.foodMeter = Math.max(this.foodMeter - 1, 0);

    if (!this.foodMeter) {
      CustomEventEmitter.emit(EventName.RemoveFood, this.id);
    }
  }

  public hasFinished() {
    return !this.foodMeter;
  }

  public isAvailable() {
    return this.animalsEating.length <= MAX_EATERS;
  }

  public startEating(id: string) {
    if (!this.animalsEating.includes(id)) {
      this.animalsEating.push(id);
    }
  }

  public stopEating(id: string) {
    const i = this.animalsEating.indexOf(id);
    if (i !== -1) {
      this.animalsEating.splice(i, 1);
    }
  }

  private updateToResizedPosition(resizedWidth: number, resizedHeight: number) {
    if (resizedWidth !== this.width || resizedHeight !== this.height) {
      this.left = this.originalLeft * (resizedWidth / this.originalWidth);
      this.top = this.originalTop * (resizedHeight / this.originalHeight);

      this.width = resizedWidth;
      this.height = resizedHeight;
    }
  }

  private getSpriteCoordinates(): CanvasCoordinates {
    const { small, medium, large } = spriteCoordinatesMap.food;
    if (this.foodMeter <= 10) {
      return small;
    }

    if (this.foodMeter <= 20) {
      return medium;
    }

    return large;
  }

  private draw(ctx: CanvasRenderingContext2D) {
    const spriteCoordinates = this.getSpriteCoordinates();
    ctx.drawImage(
      this.sprite,
      spriteCoordinates.x,
      spriteCoordinates.y,
      spriteCoordinates.width,
      spriteCoordinates.height,
      this.left,
      this.top,
      spriteCoordinates.width * RESIZE_BY,
      spriteCoordinates.height * RESIZE_BY,
    );
  }
}
