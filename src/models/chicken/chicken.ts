import { ChickenBreed, Direction, Gender } from "../../types/types";
import { generateId } from "../../utils/math";
import { RestingManager } from "./RestingManager";
import { ChickenPose, ChickenState, ChickenProps } from "./types";
import { PositionManager } from "./PositionManager";
import { HungerManager } from "./HungerManager";
import { Logger } from "../../utils/Logger";
import { spriteCoordinatesMap } from "../../utils/spriteCoordinates";
import { SavedChickenState } from "../../utils/saveUtils/migrateSaves";
import { RESIZE_BY } from "../../gameConfig";
import { Food } from "../food";

export class Chicken {
  private currentAnimation = ChickenPose.default;
  private breed: ChickenBreed;
  private state = ChickenState.wandering;
  private timestamp = 0;
  private fps = 0;
  private sprites: HTMLImageElement[];
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
    sprites,
  }: ChickenProps) {
    this.breed = breed;
    this.id = id || generateId();
    this.name = name;
    this.gender = gender;
    this.sprites = sprites;
    this.logger = new Logger({ name: "Chicken", id: this.id, color: "sienna" });

    this.RestingManager = new RestingManager();
    this.PositionManager = new PositionManager({
      canvasWidth,
      canvasHeight,
      top,
      left,
      logger: this.logger.subLogger({ name: "Position", color: "forestGreen" }),
    });
    this.HungerManager = new HungerManager({
      hungerMeter,
      id: this.id,
      logger: this.logger.subLogger({ name: "Hunger", color: "salmon" }),
    });
  }

  public update({ ctx, timestamp }: { ctx: CanvasRenderingContext2D; timestamp: number }) {
    this.fps = 1000 / (timestamp - this.timestamp);
    this.timestamp = timestamp;

    this.HungerManager.updateHungerMeter(this.timestamp);

    this.updateBehaviour();
    this.draw(ctx);
  }

  public get boundary() {
    return this.PositionManager.chickenBoundary;
  }

  public get hungerMeter() {
    return this.HungerManager.hungerMeter;
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

  private get spriteCoordinates() {
    return spriteCoordinatesMap.chicken[this.breed][this.currentAnimation];
  }

  private updateBehaviour() {
    const currentPosition = this.PositionManager.position;

    if (this.HungerManager.isEating) {
      this.updateStateAndAnimation(ChickenState.eating);
      this.HungerManager.eat(currentPosition);
      return;
    }

    const foodIsAvailable = this.HungerManager.hasAvailableFood;
    const reachedFood = this.PositionManager.hasReachedFood();

    if (foodIsAvailable && reachedFood) {
      this.updateStateAndAnimation(ChickenState.eating);
      this.HungerManager.startEating(currentPosition);
      return;
    }

    if (foodIsAvailable && !reachedFood) {
      this.updateStateAndAnimation(ChickenState.walkingToFood);
      this.PositionManager.walkTowardsFood(this.HungerManager.food as Food);
      return;
    }

    if (this.HungerManager.isHungry) {
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
    const { left, top } = this.PositionManager.position;
    const isReversedSprite = this.PositionManager.direction === Direction.left;

    ctx.drawImage(
      isReversedSprite ? this.sprites[1] : this.sprites[0],
      isReversedSprite
        ? Math.round(this.sprites[1].width - this.spriteCoordinates.x)
        : this.spriteCoordinates.x,
      this.spriteCoordinates.y,
      this.spriteCoordinates.width,
      this.spriteCoordinates.height,
      left,
      top,
      this.spriteCoordinates.width * RESIZE_BY,
      this.spriteCoordinates.height * RESIZE_BY,
    );
  }

  private updateStateAndAnimation(state: ChickenState) {
    this.logger.log("Updated behaviour -", state);
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
