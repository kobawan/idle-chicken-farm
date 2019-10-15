import { generateId } from "../utils/idGenerator";
import { Coordinates } from "../types/types";

const MAX_EATERS = 3;
const MAX_FOOD = 30;

export interface FoodProps extends Coordinates {
  width: number;
  height: number;
  prevWidth?: number;
  prevHeight?: number;
  imgs: HTMLImageElement[];
  id?: string;
  foodMeter?: number;
}

export type SavedFoodState = Pick<FoodProps, "top"|"left"|"foodMeter"|"id"|"prevHeight"|"prevWidth">; 

export class Food {
  private prevWidth: number;
  private prevHeight: number;
  private imgs: HTMLImageElement[];
  private foodMeter: number;
  private animalsEating: string[] = [];
  private originalTop: number;
  private originalLeft: number;
  public top: number;
  public left: number;
  public id: string;

  constructor({ imgs, top, left, foodMeter, id, width, height, prevHeight, prevWidth }: FoodProps) {
    this.imgs = imgs;
    this.prevWidth = prevWidth || width;
    this.prevHeight = prevHeight || height;
    this.originalTop = top;
    this.originalLeft = left;
    this.top = Math.round(top * height / this.prevHeight);
    this.left = Math.round(left * width / this.prevWidth);
    this.foodMeter = foodMeter || foodMeter === 0 ? foodMeter : MAX_FOOD;
    this.id = id || generateId();
  }

  public update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx, this.getImg());
  }

  public getSavingState() {
    return {
      top: this.originalTop,
      left: this.originalLeft,
      foodMeter: this.foodMeter,
      id: this.id,
      prevHeight: this.prevHeight,
      prevWidth: this.prevWidth,
    }
  }

  public updateFoodMeter() {
    this.foodMeter = Math.max(this.foodMeter - 1, 0);
  }

  public hasFinished() {
    return !this.foodMeter;
  }

  public isAvailable() {
    return this.animalsEating.length <= MAX_EATERS;
  }

  public startEating(id: string) {
    if(!this.animalsEating.includes(id)) {
      this.animalsEating.push(id);
    }
  }

  public stopEating(id: string) {
    const i = this.animalsEating.indexOf(id);
    if(i !== -1) {
      this.animalsEating.splice(i, 1);
    }
  }

  private getImg() {
    if(this.foodMeter <= 10) {
      return this.imgs[0];
    }

    if(this.foodMeter <= 20) {
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