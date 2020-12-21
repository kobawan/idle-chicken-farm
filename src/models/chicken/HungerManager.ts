import { Coordinates } from "../../types/types";
import { CustomEventEmitter } from "../../utils/EventEmitter";
import { EventName } from "../../utils/events";
import { Logger } from "../../utils/Logger";
import { CanvasCoordinates } from "../../utils/spriteCoordinates";
import { Food } from "../food";

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
  private id: string;
  private logger: Logger;
  public isSearchingForFood = false;
  public isEating = false;

  constructor({ hungerMeter, id }: HungerManagerProps) {
    this.hungerMeter = hungerMeter || 0;
    this.id = id;
    this.logger = new Logger("Hunger Manager", this.id);

    this.startFoodListener();
  }

  public onDestroy() {
    this.stopFoodListener();
  }

  public getSavingState() {
    return {
      hungerMeter: this.hungerMeter,
    };
  }

  public updateHungerMeter(timestamp: number) {
    if (this.isEating) {
      this.lastHungerIncrease = 0;
      return;
    }

    if (timestamp - this.lastHungerIncrease >= HUNGER_THRESHOLD) {
      this.hungerMeter = Math.min(this.hungerMeter + 1, 100);
      this.lastHungerIncrease = timestamp;
    }
  }

  public hasFood() {
    return !!this.food;
  }

  public hasReachedFood(currentPos: Coordinates) {
    if (!this.food) {
      return false;
    }
    const { dx, dy } = this.getFoodDistance(this.food, currentPos);
    return Math.abs(dx) <= MIN_DISTANCE_TO_EAT && Math.abs(dy) <= MIN_DISTANCE_TO_EAT;
  }

  public startEating(position: Coordinates) {
    if (!this.food) {
      console.error("Chicken needs food in order to start eating it!");
      return;
    }
    this.food.startEating(this.id);
    this.isEating = true;
    this.eat(position);
  }

  public eat(position: Coordinates) {
    if (!this.food) {
      console.error("Chicken needs food in order to eat it!");
      return;
    }
    this.hungerMeter = Math.max(this.hungerMeter - 1, 0);
    this.food.updateFoodMeter();
    if (this.isFull() || this.food.hasFinished()) {
      this.stopEating();

      if (!this.isFull()) {
        this.searchForFood(position);
      }
    }
  }

  public walkToFood(
    currentPos: Coordinates,
    spriteCoordinates: CanvasCoordinates,
    goToCoordinates: (dx: number, dy: number, spriteCoordinates: CanvasCoordinates) => void,
  ) {
    if (!this.food) {
      console.error("Chicken needs food in order to walk towards it!");
      return;
    }

    const { dx, dy } = this.getFoodDistance(this.food, currentPos);
    goToCoordinates(dx, dy, spriteCoordinates);
  }

  public getHungerMeter() {
    return this.hungerMeter;
  }

  public isHungry() {
    return this.hungerMeter > HUNGER_MIN;
  }

  public hasAvailableFood() {
    return !!this.food && this.food.isAvailable() && !this.food.hasFinished();
  }

  public searchForFood(position: Coordinates) {
    if (!this.isSearchingForFood) {
      this.logger.log("Start searching for food");
      this.isSearchingForFood = true;
      CustomEventEmitter.emit(EventName.RequestFood, { position, id: this.id });
    }
  }

  private addFood({ food, id }: { food: Food; id: string }) {
    if (this.id === id) {
      this.food = food;
      this.isSearchingForFood = false;
      this.logger.log("Stopped searching for food: found it!");
    }
  }

  private stopSearching({ id }: { id: string }) {
    if (this.id === id) {
      this.isSearchingForFood = false;
      this.logger.log("Stopped searching for food: did not find any!");
    }
  }

  private startFoodListener() {
    CustomEventEmitter.on(EventName.FoundRequestedFood, this.addFood.bind(this));
    CustomEventEmitter.on(EventName.NotFoundRequestedFood, this.stopSearching.bind(this));
  }

  private stopFoodListener() {
    CustomEventEmitter.off(EventName.FoundRequestedFood, this.addFood.bind(this));
    CustomEventEmitter.off(EventName.NotFoundRequestedFood, this.stopSearching.bind(this));
  }

  private isFull() {
    return !this.hungerMeter;
  }

  private stopEating() {
    if (!this.food) {
      return;
    }
    this.food.stopEating(this.id);
    this.forgetFood();
    this.isEating = false;
  }

  private forgetFood() {
    this.food = undefined;
  }

  private getFoodDistance(foodPos: Coordinates, currentPos: Coordinates) {
    return {
      dx: foodPos.left - currentPos.left,
      dy: foodPos.top - currentPos.top,
    };
  }
}
