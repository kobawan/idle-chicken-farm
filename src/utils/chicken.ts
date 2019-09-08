import { ChickenBreed, Coordinates } from "../types/types";
import { Food } from "./food";
import { generateId } from "./idGenerator";

const MOVEMENT_PX = 2;
// @todo test this
const FPS = 4;
const HUNGER_MIN = 30;

const setTurnsFromSec = (sec: number) => sec * FPS;

const RESTING_TURNS = setTurnsFromSec(10);
const RESTING_PROBABILITY = 20 / FPS;
const HUNGER_THROTTLE = setTurnsFromSec((2 * 60 * 60)/100); // every 1 min 12 sec hunger will increase

interface ChickenProps {
  imgs: HTMLImageElement[];
  width: number;
  height: number;
  breed: ChickenBreed;
}

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
  private imgIndex = 0;
  private top: number;
  private left: number;
  private currentImg: HTMLImageElement;
  private frames = 0;
  private breed: ChickenBreed;
  private state = ChickenState.walking;
  private restingTurns = 0;
  private food: Food | undefined;
  private hungerMeter = 0;
  private hasRequestedFood = false;
  private removeFood: ((id: string) => void) | undefined;
  private requestFood: ((props: Coordinates) => Food | undefined) | undefined;
  public id = generateId();

  constructor({ imgs, width, height, breed }: ChickenProps) {
    this.imgs = imgs;
    this.width = width;
    this.height = height;
    this.currentImg = this.imgs[this.imgIndex];
    this.top = Math.round(Math.random() * (this.height - this.imgs[0].naturalHeight));
    this.left = Math.round(Math.random() * (this.width - this.imgs[0].naturalWidth));
    this.breed = breed;
  }

  public update(ctx: CanvasRenderingContext2D) {
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

    this.frames++
    if(this.state !== ChickenState.eating) {
      this.updateFoodMeter();
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
    if((this.frames / HUNGER_THROTTLE) % 1 === 0) {
      this.hungerMeter = Math.min(this.hungerMeter + 1, 100);
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
    if(!this.food || !this.food.isAvailable() || this.food.hasFinished()) {
      this.clearFood(false);
      this.walkRandomly();
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
