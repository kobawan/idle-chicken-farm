import { ChickenBreed, Coordinates } from "../types/types";
import { Food } from "../models/food";
import { generateId } from "../utils/idGenerator";

const MOVEMENT_PX = 2;
const HUNGER_MIN = 30;
const MIN_DISTANCE_TO_EAT = 5;

const RESTING_TURNS_PER_SEC = 10;
const RESTING_PROBABILITY_PER_SEC = 20;
const HUNGER_THRESHOLD = process.env.NODE_ENV === "development" ? 2 : 60; // every 1 min hunger will increase

const setTurnsFromSec = (sec: number, fps: number) => Math.round(sec * fps);
const getProbabilityFromSec = (sec: number, fps: number) => Math.round(sec / fps);

export interface ChickenProps {
  imgs: HTMLImageElement[];
  width: number;
  height: number;
  prevWidth?: number;
  prevHeight?: number;
  id?: string;
  breed: ChickenBreed;
  top?: number;
  left?: number;
  hungerMeter?: number;
}

export type SavedChickenState = Pick<ChickenProps, "breed"|"id"|"top"|"left"|"hungerMeter"|"prevHeight"|"prevWidth">;

enum ChickenState {
  eating,
  walkingToFood,
  walking,
  resting,
}

export class Chicken {
  private imgs: HTMLImageElement[];
  private width: number;
  private height: number;
  private prevWidth: number;
  private prevHeight: number;
  private widthChangeRatio: number;
  private heightChangeRatio: number;
  private imgIndex = 0;
  private top: number;
  private left: number;
  private currentImg: HTMLImageElement;
  private breed: ChickenBreed;
  private state = ChickenState.walking;
  private restingTurns = 0;
  private food: Food | undefined;
  private hungerMeter: number;
  private lastHungerIncrease = 0;
  private hasRequestedFood = false;
  private removeFood: ((id: string) => void) | undefined;
  private requestFood: ((props: Coordinates) => Food | undefined) | undefined;
  private timestamp = 0;
  private fps = 0;
  public id: string;

  constructor({ imgs, id, width, height, prevWidth, prevHeight, breed, top, left, hungerMeter }: ChickenProps) {
    this.imgs = imgs;
    this.currentImg = this.imgs[this.imgIndex];
    this.width = width;
    this.height = height;
    this.prevWidth = prevWidth || this.width;
    this.prevHeight = prevHeight || this.height;
    this.heightChangeRatio = height / this.prevHeight;
    this.widthChangeRatio = width / this.prevWidth;
    this.top = top || Math.round(Math.random() * (this.height - this.imgs[0].naturalHeight))
    this.left = left || Math.round(Math.random() * (this.width - this.imgs[0].naturalWidth))
    this.breed = breed;
    this.hungerMeter = hungerMeter || 0;
    this.id = id || generateId();
  }

  public update(ctx: CanvasRenderingContext2D, timestamp: number) {
    this.fps = 1000 / (timestamp - this.timestamp)
    this.timestamp = timestamp;
    this.updateFoodMeter();

    if(this.hasFood()) {
      if(this.hasReachedFood()) {
        this.updateState(ChickenState.eating);
        this.eat();
      } else {
        this.updateState(ChickenState.walkingToFood);
        this.walkToFood();
      }
    } else if(this.shouldRest()) {
      this.updateState(ChickenState.resting);
      this.rest()
    } else {
      this.updateState(ChickenState.walking);
      this.walkRandomly();
    }

    this.draw(ctx);
  }

  public getBreed() {
    return this.breed;
  }

  public getHungerMeter() {
    return this.hungerMeter;
  }

  public setFoodMethods(
    removeFood: (id: string) => void,
    requestFood: (props: Coordinates) => Food | undefined,
  ) {
    this.removeFood = removeFood;
    this.requestFood = requestFood;
  }

  public getSavingState() {
    return {
      left: this.left,
      top: this.top,
      breed: this.breed,
      hungerMeter: this.hungerMeter,
      prevHeight: this.prevHeight,
      prevWidth: this.prevWidth,
      id: this.id,
    }
  }

  private hasFood() {
    return !!this.food;
  }

  private isHungry() {
    return this.hungerMeter > HUNGER_MIN;
  }

  private searchForFood() {
    if(!this.requestFood) {
      return;
    }
    this.food = this.requestFood({ left: this.left, top: this.top });
    if(this.food) {
      this.hasRequestedFood = true;
    }
  }

  private clearFood(reachedFood = true) {
    this.hasRequestedFood = false;
    if(!this.food || !this.removeFood) {
      return;
    }
    if(this.food.hasFinished()) {
      this.removeFood(this.food.id);
    } else if(reachedFood) {
      this.food.stopEating(this.id);
    }
    this.food = undefined;
  }

  private updateFoodMeter() {
    if(this.state === ChickenState.eating) {
      this.lastHungerIncrease = 0;
      return;
    }

    if(this.timestamp - this.lastHungerIncrease >= HUNGER_THRESHOLD * 1000) {
      this.hungerMeter = Math.min(this.hungerMeter + 1, 100);
      this.lastHungerIncrease = this.timestamp;
    }

    if(this.isHungry() && !this.hasRequestedFood) {
      this.searchForFood();
    }
  }

  private draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.currentImg,
      0,
      0,
      this.currentImg.naturalWidth,
      this.currentImg.naturalHeight,
      (this.left * this.widthChangeRatio),
      (this.top * this.heightChangeRatio),
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

  private getFoodDistance() {
    if(!this.food) {
      return;
    }

    return {
      dx: this.food.left - (this.left * this.widthChangeRatio),
      dy: this.food.top - (this.top * this.heightChangeRatio),
    }
  }

  private walkToFood() {
    const distance = this.getFoodDistance();
    if(!this.food || !this.food.isAvailable() || this.food.hasFinished() || !distance) {
      this.clearFood(false);
      this.walkRandomly();
      return;
    }

    this.goToCoordinates(distance.dx, distance.dy);
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

  private updateState(state: ChickenState) {
    this.state = state;
  }

  private eat() {
    if(!this.food) {
      return;
    }
    this.food.startEating(this.id);
    this.hungerMeter = Math.max(this.hungerMeter - 1, 0);
    this.food.updateFoodMeter();
    if(!this.hungerMeter || this.food.hasFinished()) {
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
      : setTurnsFromSec(RESTING_TURNS_PER_SEC, this.fps);
  }

  private shouldRest() {
    return (
      this.restingTurns
      || (
        !this.restingTurns
        && (Math.random() * 100) < getProbabilityFromSec(RESTING_PROBABILITY_PER_SEC, this.fps)
      )
    );
  }

  private hasReachedFood() {
    const distance = this.getFoodDistance();
    return (
      distance && Math.abs(distance.dx) <= MIN_DISTANCE_TO_EAT
      && Math.abs(distance.dy) <= MIN_DISTANCE_TO_EAT
    );
  }
}
