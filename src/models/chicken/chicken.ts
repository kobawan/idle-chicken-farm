import { ChickenBreed, Coordinates, Gender } from "../../types/types";
import { Food } from "../food";
import { generateId } from "../../utils/idGenerator";
import { RestingManager } from "./RestingManager";
import { ChickenImage, ChickenState, ChickenProps, SavedChickenState } from "./types";
import { PositionManager } from './PositionManager'
import { HungerManager } from "./HungerManager";

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
    this.HungerManager = new HungerManager({ hungerMeter, id: this.id })
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
    const currentPosition = this.PositionManager.getPosition();
    this.HungerManager.updateHungerState(this.state, this.timestamp, currentPosition);

    if(this.HungerManager.hasFood()) {
      if(this.HungerManager.hasReachedFood(currentPosition)) {
        this.updateStateAndAnimation(ChickenState.eating);
        this.HungerManager.eat();
      } else {
        this.updateStateAndAnimation(ChickenState.walkingToFood);
        this.HungerManager.walkToFood(
          currentPosition,
          this.imgs[this.currentAnimation],
          this.PositionManager.goToCoordinates.bind(this.PositionManager)
        );
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

  public getBoundaries() {
    return this.PositionManager.getBoundaries(this.imgs[this.currentAnimation]);
  }

  public getHungerMeter() {
    return this.HungerManager.getHungerMeter();
  }

  // TODO: Use custom events instead
  public setFoodMethods(
    removeFood: (id: string) => void,
    requestFood: (props: Coordinates) => Food | undefined,
  ) {
    this.HungerManager.setFoodMethods(removeFood, requestFood);
  }

  public getSavingState(): SavedChickenState {
    return {
      ...this.PositionManager.getSavingState(),
      ...this.HungerManager.getSavingState(),
      id: this.id,
      name: this.name,
      gender: this.gender,
      breed: this.breed,
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
}
