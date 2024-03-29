import { CHICKEN_HUNGER_THRESHOLD, CHICKEN_MIN_HUNGER } from "../../gameConfig";
import { Coordinates } from "../../types/types";
import { CustomEventEmitter } from "../../utils/eventUtils/EventEmitter";
import { EventName } from "../../utils/eventUtils/events";
import { Logger } from "../../utils/Logger";
import { Food } from "../food";

interface HungerManagerProps {
  hungerMeter?: number;
  id: string;
  logger: Logger;
}

export class HungerManager {
  private lastHungerIncrease = 0;
  private id: string;
  private logger: Logger;
  public food: Food | undefined;
  public hungerMeter: number;
  public isSearchingForFood = false;
  public isEating = false;

  constructor({ hungerMeter, id, logger }: HungerManagerProps) {
    this.hungerMeter = hungerMeter || 0;
    this.id = id;
    this.logger = logger;

    this.startFoodListener();
  }

  public onUnmount() {
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

    if (timestamp - this.lastHungerIncrease >= CHICKEN_HUNGER_THRESHOLD) {
      this.hungerMeter = Math.min(this.hungerMeter + 1, 100);
      this.lastHungerIncrease = timestamp;
    }
  }

  public startEating(position: Coordinates) {
    if (!this.food) {
      this.logger.error("Chicken needs food in order to start eating it!");
      return;
    }
    this.food.startEating(this.id);
    this.isEating = true;
    this.eat(position);
  }

  public eat(position: Coordinates) {
    if (!this.food) {
      this.logger.error("Chicken needs food in order to eat it!");
      return;
    }
    this.hungerMeter = Math.max(this.hungerMeter - 1, 0);
    this.food.updateFoodMeter();
    if (this.isFull || this.food.hasFinished) {
      this.stopEating();

      if (!this.isFull) {
        this.searchForFood(position);
      }
    }
  }

  public get isHungry() {
    return this.hungerMeter > CHICKEN_MIN_HUNGER;
  }

  public get hasAvailableFood() {
    return !!this.food && this.food.isAvailable;
  }

  public searchForFood(position: Coordinates) {
    if (!this.isSearchingForFood) {
      this.logger.log("Searching for food");
      this.isSearchingForFood = true;
      CustomEventEmitter.emit(EventName.RequestFood, { position, id: this.id });
    }
  }

  private addFood({ food, id }: { food: Food; id: string }) {
    if (this.id === id) {
      this.food = food;
      this.isSearchingForFood = false;
      this.logger.log("Found food!");
    }
  }

  private stopSearching({ id }: { id: string }) {
    if (this.id === id) {
      this.isSearchingForFood = false;
      this.logger.log("Did not find food!");
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

  private get isFull() {
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
}
