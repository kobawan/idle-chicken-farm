import { ChickenBreed, Gender } from "../../types/types";
import { generateId } from "../../utils/idGenerator";
import { RestingManager } from "./RestingManager";
import { ChickenPose, ChickenState, ChickenProps } from "./types";
import { PositionManager } from "./PositionManager";
import { HungerManager } from "./HungerManager";
import { Logger } from "../../utils/Logger";
import { spriteCoordinatesMap } from "../../utils/spriteCoordinates";
import { SavedChickenStateV2 } from "../../utils/migrateSaves";
import { RESIZE_BY } from "../../gameConsts";

export class Chicken {
  private currentAnimation = ChickenPose.default;
  private breed: ChickenBreed;
  private state = ChickenState.walking;
  private timestamp = 0;
  private fps = 0;
  private sprite: HTMLImageElement;
  private RestingManager: RestingManager;
  private PositionManager: PositionManager;
  private HungerManager: HungerManager;
  private logger: Logger;
  public id: string;
  public name: string;
  public gender: Gender;

  constructor({
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
    sprite,
  }: ChickenProps) {
    this.breed = breed;
    this.id = id || generateId();
    this.name = name;
    this.gender = gender;
    this.sprite = sprite;

    this.RestingManager = new RestingManager();
    this.PositionManager = new PositionManager({
      width,
      height,
      originalWidth,
      originalHeight,
      top,
      left,
      spriteCoordinates: this.getSpriteCoordinates(),
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

    this.PositionManager.updateToResizedPosition(
      resizedWidth,
      resizedHeight,
      this.getSpriteCoordinates(),
    );
    this.HungerManager.updateHungerMeter(this.timestamp);

    this.updateBehaviour();
    this.draw(ctx);
  }

  public getBoundaries() {
    return this.PositionManager.getChickenBoundaries(this.getSpriteCoordinates());
  }

  public getHungerMeter() {
    return this.HungerManager.getHungerMeter();
  }

  public getSavingState(): SavedChickenStateV2 {
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

  private getSpriteCoordinates() {
    return spriteCoordinatesMap.chicken[this.breed][this.currentAnimation];
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
        this.getSpriteCoordinates(),
        this.PositionManager.goToCoordinates.bind(this.PositionManager),
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
    this.PositionManager.walkRandomly(this.getSpriteCoordinates());
  }

  private draw(ctx: CanvasRenderingContext2D) {
    const spriteCoordinates = this.getSpriteCoordinates();
    const { left, top } = this.PositionManager.getPosition();
    ctx.drawImage(
      this.sprite,
      spriteCoordinates.x,
      spriteCoordinates.y,
      spriteCoordinates.width,
      spriteCoordinates.height,
      left,
      top,
      spriteCoordinates.width * RESIZE_BY,
      spriteCoordinates.height * RESIZE_BY,
    );
  }

  private updateStateAndAnimation(state: ChickenState) {
    this.state = state;

    switch (this.state) {
      case ChickenState.walking:
      case ChickenState.walkingToFood:
        this.currentAnimation =
          this.currentAnimation === ChickenPose.default ? ChickenPose.walking : ChickenPose.default;
        break;
      case ChickenState.resting:
        this.currentAnimation = ChickenPose.resting;
        break;
      case ChickenState.eating:
      default:
        this.currentAnimation = ChickenPose.default;
    }
  }
}
