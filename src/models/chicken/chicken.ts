import { ChickenBreed, Coordinates, Gender } from "../../types/types";
import { Food } from "../food";
import { generateId } from "../../utils/idGenerator";
import { RestingManager } from "./RestingManager";
import { ChickenImage, ChickenState, ChickenProps, SavedChickenState } from "./types";
import { PositionManager } from './PositionManager'

export const HUNGER_MIN = 30;
const MIN_DISTANCE_TO_EAT = 5;

const HUNGER_THRESHOLD = process.env.NODE_ENV === "development" ? 2000 : 60000; // every 1 min hunger will increase

export class Chicken {
  private imgs: Record<ChickenImage, HTMLImageElement>;
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
  private RestingManager: RestingManager;
  private PositionManager: PositionManager;
  public id: string;
  public name: string;
  public gender: Gender;

  constructor({
    imgs,
    id,
    width,
    height,
    originalWidth,
    originalHeight,
    breed,
    top,
    left,
    hungerMeter,
    name,
    gender
  }: ChickenProps) {
    this.imgs = {
      [ChickenImage.default]: imgs[0],
      [ChickenImage.walking]: imgs[1],
      [ChickenImage.resting]: imgs[2],
    }
    this.breed = breed;
    this.hungerMeter = hungerMeter || 0;
    this.id = id || generateId();
    this.name = name;
    this.gender = gender;

    this.RestingManager = new RestingManager()
    this.PositionManager = new PositionManager({
      width,
      height,
      originalWidth,
      originalHeight,
      top,
      left,
      image: this.imgs[this.currentAnimation]
    })
  }

  public update({ ctx, timestamp, resizedHeight, resizedWidth }: {
    ctx: CanvasRenderingContext2D,
    timestamp: number,
    resizedWidth: number,
    resizedHeight: number
  }) {
    this.fps = 1000 / (timestamp - this.timestamp)
    this.timestamp = timestamp;

    this.PositionManager.updateToResizedPosition(resizedWidth, resizedHeight);
    this.updateHungerState();

    if(this.hasFood()) {
      if(this.hasReachedFood()) {
        this.updateStateAndAnimation(ChickenState.eating);
        this.eat();
      } else {
        this.updateStateAndAnimation(ChickenState.walkingToFood);
        this.walkToFood();
      }
    } else if(this.RestingManager.shouldRest(this.fps)) {
      this.updateStateAndAnimation(ChickenState.resting);
      this.RestingManager.rest(this.fps)
    } else {
      this.updateStateAndAnimation(ChickenState.walking);
      this.PositionManager.walkRandomly(this.imgs[this.currentAnimation]);
    }

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

  public getSavingState(): SavedChickenState {
    return {
      ...this.PositionManager.getSavingState(),
      id: this.id,
      name: this.name,
      gender: this.gender,
      breed: this.breed,
      hungerMeter: this.hungerMeter,
    }
  }

  private hasFood() {
    return !!this.food;
  }

  private isHungry() {
    return this.hungerMeter > HUNGER_MIN;
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

  private updateHungerState() {
    if(this.state === ChickenState.eating) {
      this.lastHungerIncrease = 0;
      return;
    }

    if(this.timestamp - this.lastHungerIncrease >= HUNGER_THRESHOLD) {
      this.hungerMeter = Math.min(this.hungerMeter + 1, 100);
      this.lastHungerIncrease = this.timestamp;
    }

    if(this.isHungry() && !this.hasRequestedFood && this.requestFood) {
      this.food = this.requestFood(this.PositionManager.getPosition());
      if(this.food) {
        this.hasRequestedFood = true;
      }
    }
  }

  private draw(ctx: CanvasRenderingContext2D) {
    const currentImage = this.imgs[this.currentAnimation];
    const { left, top } = this.PositionManager.getPosition();
    ctx.drawImage(
      currentImage,
      0,
      0,
      currentImage.naturalWidth,
      currentImage.naturalHeight,
      left,
      top,
      currentImage.naturalWidth,
      currentImage.naturalHeight
    );
  }

  private getFoodDistance({ left, top }: Coordinates) {
    const currentPos = this.PositionManager.getPosition();
    return {
      dx: left - currentPos.left,
      dy: top - currentPos.top,
    }
  }

  private walkToFood() {
    if(!this.food || !this.food.isAvailable() || this.food.hasFinished()) {
      this.clearFood(false);
      return;
    }

    const { dx, dy } = this.getFoodDistance(this.food);
    this.PositionManager.goToCoordinates(dx, dy, this.imgs[this.currentAnimation]);
  }

  private updateStateAndAnimation(state: ChickenState) {
    this.state = state;

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
