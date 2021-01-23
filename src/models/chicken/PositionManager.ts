import { CHICKEN_MOVEMENT_PX, RESIZE_BY } from "../../gameConfig";
import { Coordinates } from "../../types/types";
import { getFenceBoundaries } from "../../utils/fenceUtils";
import { getValueWithinRange } from "../../utils/math";
import { CanvasCoordinates } from "../../utils/spriteCoordinates";
import { ChickenProps } from "./types";

interface PositionManagerProps
  extends Pick<ChickenProps, "canvasWidth" | "canvasHeight" | "topRatio" | "leftRatio"> {
  spriteCoordinates: CanvasCoordinates;
}

const setRandomPosition = (totalSize: number, imageSize: number) => {
  return Math.round(Math.random() * (totalSize - imageSize));
};

export class PositionManager {
  private canvasWidth: number;
  private canvasHeight: number;
  private top: number;
  private left: number;

  constructor({
    canvasWidth,
    canvasHeight,
    topRatio,
    leftRatio,
    spriteCoordinates,
  }: PositionManagerProps) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    const top = topRatio
      ? topRatio * this.canvasHeight
      : setRandomPosition(this.canvasHeight, spriteCoordinates.height);
    const left = leftRatio
      ? leftRatio * this.canvasWidth
      : setRandomPosition(this.canvasWidth, spriteCoordinates.width);

    const bounds = this.getGameBoundariesForChicken(spriteCoordinates);

    this.top = getValueWithinRange({
      value: top,
      min: bounds.top,
      max: bounds.bottom,
    });
    this.left = getValueWithinRange({
      value: left,
      min: bounds.left,
      max: bounds.right,
    });
  }

  public getPosition(): Coordinates {
    return { top: this.top, left: this.left };
  }

  public getChickenBoundaries(spriteCoordinates: CanvasCoordinates) {
    return {
      minX: this.left,
      maxX: this.left + spriteCoordinates.width * RESIZE_BY,
      minY: this.top,
      maxY: this.top + spriteCoordinates.height * RESIZE_BY,
    };
  }

  public getSavingState() {
    return {
      leftRatio: this.left / this.canvasWidth,
      topRatio: this.top / this.canvasHeight,
    };
  }

  public goToCoordinates(dx: number, dy: number, spriteCoordinates: CanvasCoordinates) {
    const bounds = this.getGameBoundariesForChicken(spriteCoordinates);

    this.top =
      dy > 0
        ? Math.min(this.top + CHICKEN_MOVEMENT_PX, bounds.bottom)
        : Math.max(this.top - CHICKEN_MOVEMENT_PX, bounds.top);

    this.left =
      dx > 0
        ? Math.min(this.left + CHICKEN_MOVEMENT_PX, bounds.right)
        : Math.max(this.left - CHICKEN_MOVEMENT_PX, bounds.left);
  }

  public walkRandomly(spriteCoordinates: CanvasCoordinates) {
    const dx = Math.round(Math.random());
    const dy = Math.round(Math.random());

    this.goToCoordinates(dx, dy, spriteCoordinates);
  }

  private getGameBoundariesForChicken(spriteCoordinates: CanvasCoordinates) {
    const bounds = getFenceBoundaries(this.canvasWidth, this.canvasHeight);

    return {
      left: bounds.left,
      right: bounds.right - spriteCoordinates.width * RESIZE_BY,
      top: bounds.top,
      bottom: bounds.bottom - spriteCoordinates.height * RESIZE_BY,
    };
  }
}
