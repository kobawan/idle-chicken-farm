import { ChickenBreed, Gender } from "../../types/types";
import { generateId } from "../../utils/idGenerator";
import { RestingManager } from "./RestingManager";
import {
  ChickenImage,
  ChickenState,
  ChickenProps,
  SavedChickenState,
} from "./types";
import { PositionManager } from "./PositionManager";
import { HungerManager } from "./HungerManager";
import { Logger } from "../../utils/Logger";

export class Chicken {
  private imgs: Record<ChickenImage, HTMLImageElement>;
  private currentAnimation = ChickenImage.default;
  private breed: ChickenBreed;
  private state = ChickenState.walking;
  private timestamp = 0;
  private fps = 0;
  private RestingManager: RestingManager;
  private PositionManager: PositionManager;
  private HungerManager: HungerManager;
  private logger: Logger;
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
    gender,
  }: ChickenProps) {
    this.imgs = {
      [ChickenImage.default]: imgs[0],
      [ChickenImage.walking]: imgs[1],
      [ChickenImage.resting]: imgs[2],
    };
    this.breed = breed;
    this.id = id || generateId();
    this.name = name;
    this.gender = gender;

    this.RestingManager = new RestingManager();
    this.PositionManager = new PositionManager({
      width,
      height,
      originalWidth,
      originalHeight,
      top,
      left,
      image: this.imgs[this.currentAnimation],
    });
    this.HungerManager = new HungerManager({ hungerMeter, id: this.id });

    this.logger = new Logger("Chicken Logger", this.id);
  }

  public update({
    ctx,
    timestamp,
    resizedHeight,
    resizedWidth,
  }: {
    ctx: CanvasRenderingContext2D;
    timestamp: number;
    resizedWidth: number;
    resizedHeight: number;
  }) {
    this.fps = 1000 / (timestamp - this.timestamp);
    this.timestamp = timestamp;

    this.PositionManager.updateToResizedPosition(resizedWidth, resizedHeight);
    this.HungerManager.updateHungerMeter(this.timestamp);

    this.updateBehaviour();
    this.draw(ctx);
  }

  public getBoundaries() {
    return this.PositionManager.getBoundaries(this.imgs[this.currentAnimation]);
  }

  public getHungerMeter() {
    return this.HungerManager.getHungerMeter();
  }

  public getSavingState(): SavedChickenState {
    return {
      ...this.PositionManager.getSavingState(),
      ...this.HungerManager.getSavingState(),
      id: this.id,
      name: this.name,
      gender: this.gender,
      breed: this.breed,
    };
  }

  public onDestroy() {
    this.HungerManager.onDestroy();
  }

  private updateBehaviour() {
    const currentPosition = this.PositionManager.getPosition();

    if (this.HungerManager.isEating) {
      this.logger.log("Updated behaviour: Eating");
      this.updateStateAndAnimation(ChickenState.eating);
      this.HungerManager.eat(currentPosition);
      return;
    }

    const foodIsAvailable = this.HungerManager.hasAvailableFood();
    const reachedFood = this.HungerManager.hasReachedFood(currentPosition);

    if (foodIsAvailable && reachedFood) {
      this.logger.log("Updated behaviour: Start eating");
      this.updateStateAndAnimation(ChickenState.eating);
      this.HungerManager.startEating(currentPosition);
      return;
    }

    if (foodIsAvailable && !reachedFood) {
      this.logger.log("Updated behaviour: Walking to food");
      this.updateStateAndAnimation(ChickenState.walkingToFood);
      this.HungerManager.walkToFood(
        currentPosition,
        this.imgs[this.currentAnimation],
        this.PositionManager.goToCoordinates.bind(this.PositionManager)
      );
      return;
    }

    if (this.HungerManager.isHungry()) {
      this.logger.log("Updated behaviour: Resting while waiting for food");
      this.updateStateAndAnimation(ChickenState.resting);
      this.HungerManager.searchForFood(currentPosition);
      return;
    }

    if (this.RestingManager.shouldRest(this.fps)) {
      this.logger.log("Updated behaviour: Resting");
      this.updateStateAndAnimation(ChickenState.resting);
      this.RestingManager.rest(this.fps);
      return;
    }

    this.logger.log("Updated behaviour: Walking");
    this.updateStateAndAnimation(ChickenState.walking);
    this.PositionManager.walkRandomly(this.imgs[this.currentAnimation]);
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

  private updateStateAndAnimation(state: ChickenState) {
    this.state = state;

    switch (this.state) {
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
}
