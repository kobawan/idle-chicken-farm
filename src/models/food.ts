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
  sprite: HTMLImageElement;
  id?: string;
  foodMeter?: number;
}

export class Food {
  private canvasWidth: number;
  private canvasHeight: number;
  private sprite: HTMLImageElement;
  private foodMeter: number;
  private animalsEating: string[] = [];
  public top: number;
  public left: number;
  public id: string;

  constructor({ sprite, foodMeter, id, canvasWidth, canvasHeight, left, top }: FoodProps) {
    this.sprite = sprite;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.top = top;
    this.left = left;
    this.foodMeter = foodMeter ?? FOOD_MAX_METER;
    this.id = id || generateId();
  }

  public update({ ctx }: { ctx: CanvasRenderingContext2D }) {
    this.draw(ctx);
  }

  public getSavingState(): SavedFoodState {
    return {
      topRatio: this.top / this.canvasHeight,
      leftRatio: this.left / this.canvasWidth,
      foodMeter: this.foodMeter,
      id: this.id,
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
