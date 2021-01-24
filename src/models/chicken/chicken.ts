import { ChickenBreed, Gender } from "../../types/types";
import { generateId } from "../../utils/math";
import { RestingManager } from "./RestingManager";
import { ChickenPose, ChickenState, ChickenProps } from "./types";
import { PositionManager } from "./PositionManager";
import { HungerManager } from "./HungerManager";
import { Logger } from "../../utils/Logger";
import { spriteCoordinatesMap } from "../../utils/spriteCoordinates";
import { SavedChickenState } from "../../utils/saveUtils/migrateSaves";
import { RESIZE_BY } from "../../gameConfig";

export class Chicken {
  private currentAnimation = ChickenPose.default;
  private breed: ChickenBreed;
  private state = ChickenState.wandering;
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
    canvasWidth,
    canvasHeight,
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
      canvasWidth,
      canvasHeight,
      top,
      left,
    });
    this.HungerManager = new HungerManager({ hungerMeter, id: this.id });

    this.logger = new Logger("Chicken Logger", this.id);
  }

  public update({ ctx, timestamp }: { ctx: CanvasRenderingContext2D; timestamp: number }) {
    this.fps = 1000 / (timestamp - this.timestamp);
    this.timestamp = timestamp;

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

  public onUnmount() {
    this.HungerManager.onUnmount();
  }

  private getSpriteCoordinates() {
    return spriteCoordinatesMap.chicken[this.breed][this.currentAnimation];
  }

  private updateBehaviour() {
    const currentPosition = this.PositionManager.getPosition();

    if (this.HungerManager.isEating) {
      this.updateStateAndAnimation(ChickenState.eating);
      this.HungerManager.eat(currentPosition);
      return;
    }

    const foodIsAvailable = this.HungerManager.hasAvailableFood();
    const reachedFood = this.HungerManager.hasReachedFood(currentPosition);

    if (foodIsAvailable && reachedFood) {
      this.updateStateAndAnimation(ChickenState.eating);
      this.HungerManager.startEating(currentPosition);
      return;
    }

    if (foodIsAvailable && !reachedFood) {
      this.updateStateAndAnimation(ChickenState.walkingToFood);
      this.HungerManager.walkToFood(
        currentPosition,
        this.PositionManager.walkTowardsDirection.bind(this.PositionManager),
      );
      return;
    }

    if (this.HungerManager.isHungry()) {
      this.updateStateAndAnimation(ChickenState.searchingForFood);
      this.HungerManager.searchForFood(currentPosition);
      return;
    }

    if (this.RestingManager.shouldRest(this.fps)) {
      this.updateStateAndAnimation(ChickenState.resting);
      this.RestingManager.rest(this.fps);
      return;
    }

    this.updateStateAndAnimation(ChickenState.wandering);
    this.PositionManager.walkRandomly();
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
    this.logger.log("Updated behaviour: ", state);
    this.state = state;

    switch (this.state) {
      case ChickenState.wandering:
      case ChickenState.walkingToFood:
        this.currentAnimation =
          this.currentAnimation === ChickenPose.default ? ChickenPose.walking : ChickenPose.default;
        break;
      case ChickenState.searchingForFood:
      case ChickenState.resting:
        this.currentAnimation = ChickenPose.resting;
        break;
      case ChickenState.eating:
      default:
        this.currentAnimation = ChickenPose.default;
    }
  }
}
