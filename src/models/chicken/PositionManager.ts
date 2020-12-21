import { RESIZE_BY } from "../../gameConsts";
import { Coordinates } from "../../types/types";
import { CanvasCoordinates } from "../../utils/spriteCoordinates";

const MOVEMENT_PX = 2;

interface PositionManagerProps {
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
  top?: number;
  left?: number;
  spriteCoordinates: CanvasCoordinates;
}

const setRandomPosition = (totalSize: number, imageSize: number) => {
  return Math.round(Math.random() * (totalSize - imageSize));
};

export class PositionManager {
  private width: number;
  private height: number;
  private originalWidth: number;
  private originalHeight: number;
  private widthChangeRatio: number;
  private heightChangeRatio: number;
  private top: number;
  private left: number;

  constructor({
    width,
    height,
    originalHeight,
    originalWidth,
    top,
    left,
    spriteCoordinates,
  }: PositionManagerProps) {
    this.width = width;
    this.height = height;
    this.originalWidth = originalWidth || this.width;
    this.originalHeight = originalHeight || this.height;
    this.heightChangeRatio = height / this.originalHeight;
    this.widthChangeRatio = width / this.originalWidth;

    const originalTop = top || setRandomPosition(this.height, spriteCoordinates.height);
    const originalLeft = left || setRandomPosition(this.width, spriteCoordinates.width);
    this.top = originalTop * this.heightChangeRatio;
    this.left = originalLeft * this.widthChangeRatio;
  }

  public getPosition(): Coordinates {
    return { top: this.top, left: this.left };
  }

  public getBoundaries(spriteCoordinates: CanvasCoordinates) {
    return {
      minX: this.left,
      maxX: this.left + spriteCoordinates.width * RESIZE_BY,
      minY: this.top,
      maxY: this.top + spriteCoordinates.height * RESIZE_BY,
    };
  }

  public getSavingState() {
    return {
      left: this.left / this.widthChangeRatio,
      top: this.top / this.heightChangeRatio,
      originalHeight: this.originalHeight,
      originalWidth: this.originalWidth,
    };
  }

  public updateToResizedPosition(resizedWidth: number, resizedHeight: number) {
    if (resizedWidth !== this.width || resizedHeight !== this.height) {
      this.left = this.left * (resizedWidth / this.width);
      this.top = this.top * (resizedHeight / this.height);

      this.width = resizedWidth;
      this.height = resizedHeight;
    }
  }

  public goToCoordinates(dx: number, dy: number, spriteCoordinates: CanvasCoordinates) {
    const { height, width } = spriteCoordinates;

    this.top =
      dy > 0
        ? Math.min(this.top + MOVEMENT_PX, this.height - height)
        : Math.max(this.top - MOVEMENT_PX, 0);

    this.left =
      dx > 0
        ? Math.min(this.left + MOVEMENT_PX, this.width - width)
        : Math.max(this.left - MOVEMENT_PX, 0);
  }

  public walkRandomly(spriteCoordinates: CanvasCoordinates) {
    const dx = Math.round(Math.random());
    const dy = Math.round(Math.random());

    this.goToCoordinates(dx, dy, spriteCoordinates);
  }
}
