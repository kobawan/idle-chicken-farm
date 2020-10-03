import { Coordinates } from "../../types/types";
import { Food } from "../food";
import { ChickenState } from "./types";

export const HUNGER_MIN = 30;
const MIN_DISTANCE_TO_EAT = 5;

const HUNGER_THRESHOLD = process.env.NODE_ENV === "development" ? 2000 : 60000; // every 1 min hunger will increase

interface HungerManagerProps {
  hungerMeter?: number;
  id: string;
}

export class HungerManager {
  private food: Food | undefined;
  private hungerMeter: number;
  private lastHungerIncrease = 0;
  private hasRequestedFood = false;
  private removeFood: ((id: string) => void) | undefined;
  private requestFood: ((props: Coordinates) => Food | undefined) | undefined;
  private id: string;

  constructor({ hungerMeter, id }: HungerManagerProps) {
    this.hungerMeter = hungerMeter || 0;
    this.id = id;
  }

  public getSavingState() {
    return {
      hungerMeter: this.hungerMeter,
    }
  }

  public updateHungerState(
    state: ChickenState,
    timestamp: number,
    position: Coordinates
  ) {
    if(state === ChickenState.eating) {
      this.lastHungerIncrease = 0;
      return;
    }

    if(timestamp - this.lastHungerIncrease >= HUNGER_THRESHOLD) {
      this.hungerMeter = Math.min(this.hungerMeter + 1, 100);
      this.lastHungerIncrease = timestamp;
    }

    if(this.isHungry() && !this.hasRequestedFood && this.requestFood) {
      this.food = this.requestFood(position);
      if(this.food) {
        this.hasRequestedFood = true;
      }
    }
  }

  public hasFood() {
    return !!this.food;
  }

  public hasReachedFood(currentPos: Coordinates) {
    if(!this.food) {
      return false;
    }
    const { dx, dy } = this.getFoodDistance(this.food, currentPos);
    return Math.abs(dx) <= MIN_DISTANCE_TO_EAT && Math.abs(dy) <= MIN_DISTANCE_TO_EAT;
  }


  public eat() {
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

  public walkToFood(
    currentPos: Coordinates,
    currentImage: HTMLImageElement,
    goToCoordinates: (dx: number, dy: number, image: HTMLImageElement) => void
  ) {
    if(!this.food || !this.food.isAvailable() || this.food.hasFinished()) {
      this.clearFood(false);
      return;
    }

    const { dx, dy } = this.getFoodDistance(this.food, currentPos);
    goToCoordinates(dx, dy, currentImage);
  }

  public setFoodMethods(
    removeFood: (id: string) => void,
    requestFood: (props: Coordinates) => Food | undefined,
  ) {
    this.removeFood = removeFood;
    this.requestFood = requestFood;
  }

  public getHungerMeter() {
    return this.hungerMeter;
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

  private getFoodDistance(foodPos: Coordinates, currentPos: Coordinates) {
    return {
      dx: foodPos.left - currentPos.left,
      dy: foodPos.top - currentPos.top,
    }
  }
}
