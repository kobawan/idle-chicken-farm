import { CHICKEN_MOVEMENT_PX, RESIZE_BY } from "../../gameConfig";
import { Coordinates } from "../../types/types";
import { CanvasCoordinates } from "../../utils/spriteCoordinates";
import { globalPositionManager } from "../globalPositionManager";
import { ChickenProps } from "./types";

type PositionManagerProps = Pick<ChickenProps, "canvasWidth" | "canvasHeight" | "top" | "left">;

export class PositionManager {
  private canvasWidth: number;
  private canvasHeight: number;
  private top: number;
  private left: number;

  constructor({ canvasWidth, canvasHeight, top, left }: PositionManagerProps) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    const boundedPos = globalPositionManager.getPositionWithinBounds({ top, left });

    this.top = boundedPos.top;
    this.left = boundedPos.left;
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

  public walkTowardsDirection(dx: number, dy: number) {
    const { left, top } = this.getNewPosition(dx, dy);

    const canGoToZone = globalPositionManager.canGoToZone({ left, top });

    // TODO: go around obstacle instead of throwing error
    if (!canGoToZone) {
      return;
    }

    this.top = top;
    this.left = left;
  }

  public walkRandomly() {
    // TODO: first check which directions are available
    const dx = Math.round(Math.random());
    const dy = Math.round(Math.random());
    const { left, top } = this.getNewPosition(dx, dy);

    const canGoToZone = globalPositionManager.canGoToZone({ left, top });

    if (!canGoToZone) {
      return;
    }

    this.top = top;
    this.left = left;
  }

  private getNewPosition = (dx: number, dy: number) => {
    const left = dx > 0 ? this.left + CHICKEN_MOVEMENT_PX : this.left - CHICKEN_MOVEMENT_PX;
    const top = dy > 0 ? this.top + CHICKEN_MOVEMENT_PX : this.top - CHICKEN_MOVEMENT_PX;

    return { left, top };
  };
}
