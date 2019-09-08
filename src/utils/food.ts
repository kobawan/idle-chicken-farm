import { generateId } from "./idGenerator";

const MAX_EATERS = 3;

export interface FoodProps {
  imgs: HTMLImageElement[];
  top: number;
  left: number;
}

export class Food {
  private imgs: HTMLImageElement[];
  private foodMeter = 30;
  private animalsEating: string[] = [];
  public top: number;
  public left: number;
  public id = generateId();

  constructor({ imgs, top, left }: FoodProps) {
    this.imgs = imgs;
    this.top = top;
    this.left = left;
  }

  public update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx, this.getImg());
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