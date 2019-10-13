import { generateId } from "./idGenerator";
import { Coordinates } from "../types/types";

const MAX_EATERS = 3;
const MAX_FOOD = 30;

export interface FoodProps extends Coordinates {
  imgs: HTMLImageElement[];
  foodMeter?: number;
}

export type SavedFoodState = Pick<FoodProps, "top"|"left"|"foodMeter">; 

export class Food {
  private imgs: HTMLImageElement[];
  private foodMeter: number;
  private animalsEating: string[] = [];
  public top: number;
  public left: number;
  public id = generateId();

  constructor({ imgs, top, left, foodMeter }: FoodProps) {
    this.imgs = imgs;
    this.top = top;
    this.left = left;
    this.foodMeter = foodMeter || foodMeter === 0 ? foodMeter : MAX_FOOD;
  }

  public update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx, this.getImg());
  }

  public getSavingState() {
    return {
      top: this.top,
      left: this.left,
      foodMeter: this.foodMeter,
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