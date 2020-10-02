import { ChickenBreed, Coordinates, Gender } from "../../types/types";
import { Food } from "../food";
import { generateId } from "../../utils/idGenerator";
import { RestingManager } from "./RestingManager";
import { ChickenImage, ChickenState, ChickenProps } from "./types";

const MOVEMENT_PX = 2;
export const HUNGER_MIN = 30;
const MIN_DISTANCE_TO_EAT = 5;

const HUNGER_THRESHOLD = process.env.NODE_ENV === "development" ? 2000 : 60000; // every 1 min hunger will increase

export class Chicken {
  private imgs: Record<ChickenImage, HTMLImageElement>;
  private width: number;
  private height: number;
  private originalWidth: number;
  private originalHeight: number;
  private widthChangeRatio: number;
  private heightChangeRatio: number;
  private top: number;
  private left: number;
  private currentAnimation = ChickenImage.default;
  private breed: ChickenBreed;
  private state = ChickenState.walking;
  private food: Food | undefined;
  private hungerMeter: number;
  private lastHungerIncrease = 0;
  private hasRequestedFood = false;
  private removeFood: ((id: string) => void) | undefined;
  private requestFood: ((props: Coordinates) => Food | undefined) | undefined;
  private timestamp = 0;
  private fps = 0;
  private RestingManager = new RestingManager();
  public id: string;
  public name: string;
  public gender: Gender;

  constructor({ imgs, id, width, height, originalWidth, originalHeight, breed, top, left, hungerMeter, name, gender }: ChickenProps) {
    this.imgs = {
      [ChickenImage.default]: imgs[0],
      [ChickenImage.walking]: imgs[1],
      [ChickenImage.resting]: imgs[2],
    }
    this.width = width;
    this.height = height;
    this.originalWidth = originalWidth || this.width;
    this.originalHeight = originalHeight || this.height;
    this.heightChangeRatio = height / this.originalHeight;
    this.widthChangeRatio = width / this.originalWidth;
    const defaultImage = this.imgs[ChickenImage.default];
    const originalTop = top || Math.round(Math.random() * (this.height - defaultImage.naturalHeight));
    const originalLeft = left || Math.round(Math.random() * (this.width - defaultImage.naturalWidth));
    this.top = originalTop * this.heightChangeRatio;
    this.left = originalLeft * this.widthChangeRatio;
    this.breed = breed;
    this.hungerMeter = hungerMeter || 0;
    this.id = id || generateId();
    this.name = name;
    this.gender = gender;
  }

  public update({ ctx, timestamp, resizedHeight, resizedWidth }: {
    ctx: CanvasRenderingContext2D,
    timestamp: number,
    resizedWidth: number,
    resizedHeight: number
  }) {
    this.fps = 1000 / (timestamp - this.timestamp)
    this.timestamp = timestamp;

    this.updateToResizedPosition(resizedWidth, resizedHeight);
    this.updateFoodMeter();

    if(this.hasFood()) {
      if(this.hasReachedFood()) {
        this.updateState(ChickenState.eating);
        this.eat();
      } else {
        this.updateState(ChickenState.walkingToFood);
        this.walkToFood();
      }
    } else if(this.RestingManager.shouldRest(this.fps)) {
      this.updateState(ChickenState.resting);
      this.RestingManager.rest(this.fps)
    } else {
      this.updateState(ChickenState.walking);
      this.walkRandomly();
    }

    this.updateAnimation();
    this.draw(ctx);
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
      left: this.left / this.widthChangeRatio,
      top: this.top / this.heightChangeRatio,
      breed: this.breed,
      hungerMeter: this.hungerMeter,
      originalHeight: this.originalHeight,
      originalWidth: this.originalWidth,
      id: this.id,
      name: this.name,
      gender: this.gender,
    }
  }

  private updateToResizedPosition(resizedWidth: number, resizedHeight: number) {
    if(resizedWidth !== this.width || resizedHeight !== this.height) {
      this.left = this.left * (resizedWidth / this.width);
      this.top = this.top * (resizedHeight / this.height);

      this.width = resizedWidth;
      this.height = resizedHeight;
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

    if(this.timestamp - this.lastHungerIncrease >= HUNGER_THRESHOLD) {
      this.hungerMeter = Math.min(this.hungerMeter + 1, 100);
      this.lastHungerIncrease = this.timestamp;
    }

    if(this.isHungry() && !this.hasRequestedFood) {
      this.searchForFood();
    }
  }

  private updateAnimation() {
    switch(this.state) {
      case ChickenState.walking:
      case ChickenState.walkingToFood:
        this.currentAnimation =
          this.currentAnimation === ChickenImage.default
            ? ChickenImage.walking
            : ChickenImage.default;
        break;
      case ChickenState.resting:
        this.currentAnimation = ChickenImage.resting;
        break;
      case ChickenState.eating:
      default:
        this.currentAnimation = ChickenImage.default;
    }
  }

  private draw(ctx: CanvasRenderingContext2D) {
    const currentImage = this.imgs[this.currentAnimation];
    ctx.drawImage(
      currentImage,
      0,
      0,
      currentImage.naturalWidth,
      currentImage.naturalHeight,
      this.left,
      this.top,
      currentImage.naturalWidth,
      currentImage.naturalHeight
    );
  }

  private walkRandomly() {
    const dx = Math.round(Math.random() * 1);
    const dy = Math.round(Math.random() * 1);

    this.goToCoordinates(dx, dy);
  }

  private getFoodDistance({ left, top }: Coordinates) {
    return {
      dx: left - this.left,
      dy: top - this.top,
    }
  }

  private walkToFood() {
    if(!this.food || !this.food.isAvailable() || this.food.hasFinished()) {
      this.clearFood(false);
      return;
    }

    const { dx, dy } = this.getFoodDistance(this.food);
    this.goToCoordinates(dx, dy);
  }

  private goToCoordinates(dx: number, dy: number) {
    const { naturalHeight, naturalWidth } = this.imgs[this.currentAnimation];

    this.top = dy > 0
      ? Math.min(this.top + MOVEMENT_PX, this.height - naturalHeight)
      : Math.max(this.top - MOVEMENT_PX, 0)
    ;

    this.left = dx > 0
      ? Math.min(this.left + MOVEMENT_PX, this.width - naturalWidth)
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

  private hasReachedFood() {
    if(!this.food) {
      return false;
    }
    const { dx, dy } = this.getFoodDistance(this.food);
    return Math.abs(dx) <= MIN_DISTANCE_TO_EAT && Math.abs(dy) <= MIN_DISTANCE_TO_EAT;
  }
}
