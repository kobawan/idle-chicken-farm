import { generateId } from "../utils/math";
import { Coordinates } from "../types/types";
import { CustomEventEmitter } from "../utils/eventUtils/EventEmitter";
import { EventName } from "../utils/eventUtils/events";
import { SavedFoodState } from "../utils/saveUtils/migrateSaves";
import { CanvasCoordinates, spriteCoordinatesMap } from "../utils/spriteCoordinates";
import { FOOD_MAX_EATERS, FOOD_MAX_METER, RESIZE_BY } from "../gameConfig";

export interface FoodProps extends Coordinates {
  canvasWidth: number;
  canvasHeight: number;
  originalWidth?: number;
  originalHeight?: number;
  sprite: HTMLImageElement;
  id?: string;
  foodMeter?: number;
}

export class Food {
  private originalWidth: number;
  private originalHeight: number;
  private canvasWidth: number;
  private canvasHeight: number;
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
    canvasWidth,
    canvasHeight,
    originalHeight,
    originalWidth,
  }: FoodProps) {
    this.sprite = sprite;
    this.originalWidth = originalWidth || canvasWidth;
    this.originalHeight = originalHeight || canvasHeight;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.originalTop = top;
    this.originalLeft = left;
    this.top = top * (canvasHeight / this.originalHeight);
    this.left = left * (canvasWidth / this.originalWidth);
    this.foodMeter = foodMeter ?? FOOD_MAX_METER;
    this.id = id || generateId();
  }

  public update({
    ctx,
    canvasHeight,
    canvasWidth,
  }: {
    ctx: CanvasRenderingContext2D;
    canvasWidth: number;
    canvasHeight: number;
  }) {
    this.updateToResizedPosition(canvasWidth, canvasHeight);
    this.draw(ctx);
  }

  public getSavingState(): SavedFoodState {
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
    return this.animalsEating.length <= FOOD_MAX_EATERS && !this.hasFinished();
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

  private updateToResizedPosition(canvasWidth: number, canvasHeight: number) {
    if (canvasWidth !== this.canvasWidth || canvasHeight !== this.canvasHeight) {
      this.left = this.originalLeft * (canvasWidth / this.originalWidth);
      this.top = this.originalTop * (canvasHeight / this.originalHeight);

      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
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
