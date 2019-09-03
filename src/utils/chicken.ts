import { ChickenBreed } from "../types/types";
import { StaticObject } from "./staticObject";

const MOVEMENT_PX = 2;
const RESTING_TURNS = 15;
const RESTING_PROBABILITY = 10;
const EATING_TURNS = 10;

interface ChickenProps {
  imgs: HTMLImageElement[];
  width: number;
  height: number;
  breed: ChickenBreed;
}

export class Chicken {
  imgs: HTMLImageElement[];
  width: number;
  height: number;
  imgIndex = 0;
  top: number;
  left: number;
  currentImg: HTMLImageElement;
  restingTurns = 0;
  eatingTurns = 0;
  food: StaticObject | undefined;
  breed: ChickenBreed;
  removeFood: ((id: number) => void) | undefined;
  id = 0;

  constructor({ imgs, width, height, breed }: ChickenProps) {
    this.imgs = imgs;
    this.width = width;
    this.height = height;
    this.currentImg = this.imgs[this.imgIndex];
    this.top = Math.round(Math.random() * (this.height - this.imgs[0].naturalHeight));
    this.left = Math.round(Math.random() * (this.width - this.imgs[0].naturalWidth));
    this.breed = breed;
    this.id = Date.now();
  }

  public update(ctx: CanvasRenderingContext2D) {
    if(this.hasFood()) {
      if(this.hasReachedFood()) {
        this.eat();
      } else {
        this.walkToFood();
      }
    } else if(this.shouldRest()) {
      this.rest()
    } else {
      this.walkRandomly();
    }

    this.draw(ctx);
  }

  public getBreed() {
    return this.breed;
  }

  public hasFood() {
    return !!this.food;
  }

  public setFood(food: StaticObject, removeFood: (id: number) => void) {
    this.food = food;
    this.eatingTurns = EATING_TURNS;
    this.removeFood = removeFood;
  }

  private clearFood() {
    if(this.removeFood && this.food) {
      this.removeFood(this.food.id)
    }
    this.removeFood = undefined;
    this.food = undefined;
    this.eatingTurns = 0;
  }

  private draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.currentImg,
      0,
      0,
      this.currentImg.naturalWidth,
      this.currentImg.naturalHeight,
      this.left,
      this.top,
      this.currentImg.naturalWidth,
      this.currentImg.naturalHeight
    );
  }

  private walkRandomly() {
    const dx = Math.round(Math.random() * 1);
    const dy = Math.round(Math.random() * 1);

    this.goToCoordinates(dx, dy);
    this.walk();
  }

  private walkToFood() {
    if(!this.food) {
      return;
    }
    const dx = this.food.left - this.left;
    const dy = this.food.top - this.top;

    this.goToCoordinates(dx, dy);
    this.walk();
  }

  private goToCoordinates(dx: number, dy: number) {
    this.top = dy > 0
      ? Math.min(this.top + MOVEMENT_PX, this.height - this.currentImg.naturalHeight)
      : Math.max(this.top - MOVEMENT_PX, 0)
    ;

    this.left = dx > 0
      ? Math.min(this.left + MOVEMENT_PX, this.width - this.currentImg.naturalWidth)
      : Math.max(this.left - MOVEMENT_PX, 0)
    ;
  }

  private eat() {
    this.eatingTurns--;
    if(this.eatingTurns < 0) {
      this.clearFood();
    }
  }

  private walk() {
    this.currentImg = this.imgs[this.imgIndex];
    this.imgIndex = this.imgIndex + 1 >= this.imgs.length - 1 ? 0 : this.imgIndex + 1;
  }

  private rest() {
    this.currentImg = this.imgs[this.imgs.length - 1];
    this.restingTurns = this.restingTurns
      ? Math.max(this.restingTurns - 1, 0)
      : RESTING_TURNS;
  }

  private shouldRest() {
    return this.restingTurns || (!this.restingTurns && (Math.random() * 100) < RESTING_PROBABILITY);
  }

  private hasReachedFood() {
    if(!this.food) {
      return false;
    }
    const dx = this.food.left - this.left;
    const dy = this.food.top - this.top;
    return Math.abs(dx) <= 2 && Math.abs(dy) <= 2;
  }
}
