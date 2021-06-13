import { CHICKEN_MOVEMENT_PX } from "../../gameConfig";
import { Boundary, Coordinates, Direction } from "../../types/types";
import { Logger } from "../../utils/Logger";
import { getRandomValue } from "../../utils/math";
import { CHICKEN_RADIUS, CHICKEN_SIZE, FOOD_RADIUS } from "../../utils/spriteCoordinates";
import { Food } from "../food";
import { globalPositionManager } from "../globalPositionManager";
import { ChickenProps } from "./types";

const POSSIBLE_DIRECTIONS: [number, number][] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

interface PositionManagerProps
  extends Pick<ChickenProps, "canvasWidth" | "canvasHeight" | "top" | "left"> {
  logger: Logger;
}

export class PositionManager {
  private canvasWidth: number;
  private canvasHeight: number;
  private top: number;
  private left: number;
  private logger: Logger;
  private path: Coordinates[] = [];
  private hasBegunJourney = false;
  public direction: Direction = Direction.right;

  constructor({ canvasWidth, canvasHeight, top, left, logger }: PositionManagerProps) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.logger = logger;

    const boundedPos = globalPositionManager.getPositionWithinBounds({
      top,
      left,
      ...CHICKEN_SIZE,
    });

    this.top = boundedPos.top;
    this.left = boundedPos.left;
  }

  public get position(): Coordinates {
    return { top: this.top, left: this.left };
  }

  public get chickenBoundary(): Boundary {
    return {
      minX: this.left,
      maxX: this.left + CHICKEN_SIZE.width,
      minY: this.top,
      maxY: this.top + CHICKEN_SIZE.height,
    };
  }

  public getSavingState() {
    return {
      leftRatio: this.left / this.canvasWidth,
      topRatio: this.top / this.canvasHeight,
    };
  }

  get currentCheckpoint() {
    return this.path[0];
  }

  private removeCurrentCheckpoint() {
    this.path.shift();
  }

  private calculatePathToFood(food: Food) {
    const destination = { left: food.left + FOOD_RADIUS, top: food.top + FOOD_RADIUS };

    // FIXME: check for obstacles and add checkpoints
    this.path = [destination];
  }

  public walkTowardsFood(food: Food) {
    if (!this.path.length) {
      this.calculatePathToFood(food);
      this.hasBegunJourney = true;
    }

    const { dx, dy } = this.getDistance(this.currentCheckpoint);
    const { left, top } = this.getNewPosition(dx, dy);
    this.updateDirection(dx, CHICKEN_MOVEMENT_PX);

    this.top = top;
    this.left = left;

    if (this.hasReachedDestination(this.currentCheckpoint)) {
      this.removeCurrentCheckpoint();
    }
  }

  private hasReachedDestination(destination: Coordinates) {
    const { dx, dy } = this.getDistance(destination);
    const acceptableDistance = CHICKEN_RADIUS;
    return Math.abs(dx) <= acceptableDistance && Math.abs(dy) <= acceptableDistance;
  }

  private getDistance(destination: Coordinates) {
    return {
      dx: Math.round(destination.left - this.left - CHICKEN_RADIUS),
      dy: Math.round(destination.top - this.top - CHICKEN_RADIUS),
    };
  }

  public hasReachedFood() {
    if (this.hasBegunJourney && this.path.length === 0) {
      this.hasBegunJourney = false;
      return true;
    }
    return false;
  }

  public walkRandomly() {
    let directionsToTry = [...POSSIBLE_DIRECTIONS];
    let left, top;
    do {
      const randIndex = getRandomValue(directionsToTry.length - 1);
      const [dx, dy] = directionsToTry[randIndex];

      this.logger.log(`Trying direction: [${dx},${dy}]`);
      directionsToTry.splice(randIndex, 1);
      this.updateDirection(dx);

      left = this.left + CHICKEN_MOVEMENT_PX * dx;
      top = this.top + CHICKEN_MOVEMENT_PX * dy;
    } while (
      !globalPositionManager.canGoToCoordinates({
        left,
        top,
        ...CHICKEN_SIZE,
      }) &&
      directionsToTry.length
    );

    this.top = top;
    this.left = left;
  }

  private getNewPosition = (dx: number, dy: number) => {
    return {
      left:
        dx === 0
          ? this.left
          : dx > 0
          ? this.left + CHICKEN_MOVEMENT_PX
          : this.left - CHICKEN_MOVEMENT_PX,
      top:
        dy === 0
          ? this.top
          : dy > 0
          ? this.top + CHICKEN_MOVEMENT_PX
          : this.top - CHICKEN_MOVEMENT_PX,
    };
  };

  private updateDirection(dx: number, limit?: number) {
    if (dx === 0 || (limit && dx <= limit)) {
      return;
    }
    this.direction = dx > 0 ? Direction.right : Direction.left;
  }
}
