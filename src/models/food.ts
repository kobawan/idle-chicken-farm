import { generateId } from "../utils/idGenerator";
import { Coordinates } from "../types/types";
import { CustomEventEmitter } from "../utils/EventEmitter";
import { EventName } from "../utils/events";

const MAX_EATERS = 3;
const MAX_FOOD = 30;

export interface FoodProps extends Coordinates {
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
  imgs: HTMLImageElement[];
  id?: string;
  foodMeter?: number;
}

export type SavedFoodState = Pick<
  FoodProps,
  "top" | "left" | "foodMeter" | "id" | "originalHeight" | "originalWidth"
>;

export class Food {
  private originalWidth: number;
  private originalHeight: number;
  private width: number;
  private height: number;
  private imgs: HTMLImageElement[];
  private foodMeter: number;
  private animalsEating: string[] = [];
  private originalTop: number;
  private originalLeft: number;
  public top: number;
  public left: number;
  public id: string;

  constructor({
    imgs,
    top,
    left,
    foodMeter,
    id,
    width,
    height,
    originalHeight,
    originalWidth,
  }: FoodProps) {
    this.imgs = imgs;
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
    this.draw(ctx, this.getImg());
  }

  public getSavingState() {
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

  private getImg() {
    if (this.foodMeter <= 10) {
      return this.imgs[0];
    }

    if (this.foodMeter <= 20) {
      return this.imgs[1];
    }

    return this.imgs[2];
  }

  private draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      this.left,
      this.top,
      img.naturalWidth,
      img.naturalHeight
    );
  }
}
