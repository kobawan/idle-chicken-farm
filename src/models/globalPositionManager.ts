import { FOOD_MAX_DISTANCE_PX, RESIZE_BY } from "../gameConfig";
import { Coordinates, Dimensions } from "../types/types";
import { getDistance, getClosest } from "../utils/distance";
import { getCoopProps, getTroughProps } from "../utils/drawItems";
import { getFenceBoundaries } from "../utils/fenceUtils";
import { getRandomValue, getClosestValueWithinRange, isInRange } from "../utils/math";
import { Food } from "./food";

interface GlobalPositionManagerProps {
  canvasWidth: number;
  canvasHeight: number;
}

export interface Zone extends Coordinates {
  right: number;
  bottom: number;
}

type ZoneParams = Coordinates & Dimensions;

class GlobalPositionManager {
  private canvasHeight: number;
  private canvasWidth: number;

  public get noGoZones(): Zone[] {
    const coop = getCoopProps(this.canvasWidth, this.canvasHeight);
    const coopZone = {
      left: coop.left,
      top: coop.top,
      right: coop.left + coop.spriteCoordinates.width * RESIZE_BY,
      bottom: coop.top + coop.spriteCoordinates.height * RESIZE_BY,
    };

    const trough = getTroughProps(this.canvasWidth, this.canvasHeight);
    const troughZone = {
      left: trough.left + trough.deviationX,
      top: trough.top + trough.deviationY,
      right: trough.left + trough.deviationX + trough.spriteCoordinates.width * RESIZE_BY,
      bottom: trough.top + trough.deviationY + trough.spriteCoordinates.height * RESIZE_BY,
    };

    // FIXME: items need be in order of left to right in the screen
    return [coopZone, troughZone];
  }

  private get gameBoundaries(): Zone {
    return getFenceBoundaries(this.canvasWidth, this.canvasHeight);
  }

  // TODO: Let's do it dynamically
  public get freeZones() {
    return [
      {
        left: this.gameBoundaries.left,
        top: this.gameBoundaries.top,
        right: this.noGoZones[0].left,
        bottom: this.noGoZones[0].top,
      },
      {
        left: this.gameBoundaries.left,
        top: this.noGoZones[0].top,
        right: this.noGoZones[0].left,
        bottom: this.noGoZones[0].bottom,
      },
      {
        left: this.gameBoundaries.left,
        top: this.noGoZones[0].bottom,
        right: this.noGoZones[0].left,
        bottom: this.gameBoundaries.bottom,
      },
      {
        left: this.noGoZones[0].left,
        top: this.gameBoundaries.top,
        right: this.noGoZones[0].right,
        bottom: this.noGoZones[0].top,
      },
      {
        left: this.noGoZones[0].left,
        top: this.noGoZones[0].bottom,
        right: this.noGoZones[0].right,
        bottom: this.gameBoundaries.bottom,
      },
      {
        left: this.noGoZones[0].right,
        top: this.gameBoundaries.top,
        right: this.noGoZones[1].right,
        bottom: this.noGoZones[1].top,
      },
      {
        left: this.noGoZones[0].right,
        top: this.noGoZones[1].bottom,
        right: this.noGoZones[1].right,
        bottom: this.gameBoundaries.bottom,
      },
      {
        left: this.noGoZones[1].right,
        top: this.gameBoundaries.top,
        right: this.gameBoundaries.right,
        bottom: this.gameBoundaries.bottom,
      },
    ];
  }

  constructor({ canvasHeight, canvasWidth }: GlobalPositionManagerProps) {
    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;
  }

  public updateCanvasDimension({ canvasHeight, canvasWidth }: GlobalPositionManagerProps) {
    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;
  }

  public getClosestFood = (coord: Coordinates, food: Food[]) => {
    const allAvailableFood = food.filter(
      (item) => item.isAvailable() && getDistance(coord, item) < FOOD_MAX_DISTANCE_PX,
    );
    if (!allAvailableFood.length) {
      return undefined;
    }
    return getClosest({
      items: allAvailableFood,
      ...coord,
    });
  };

  public canGoToCoordinates({ left, width, height, top }: ZoneParams) {
    const isInsideFence =
      isInRange({
        value: left,
        min: this.gameBoundaries.left,
        max: this.gameBoundaries.right - width,
      }) &&
      isInRange({
        value: top,
        min: this.gameBoundaries.top,
        max: this.gameBoundaries.bottom - height,
      });

    const isInNoGoZone = this.noGoZones.some((zone) => {
      return (
        isInRange({ value: left, min: zone.left - width, max: zone.right }) &&
        isInRange({ value: top, min: zone.top - height, max: zone.bottom })
      );
    });
    return isInsideFence && !isInNoGoZone;
  }

  private getRandomPositionWithinBounds = ({ width, height }: Dimensions) => {
    const randIndex = getRandomValue(this.freeZones.length - 1);
    const chosenZone = this.freeZones[randIndex];

    return {
      top: chosenZone.top + getRandomValue(chosenZone.bottom - chosenZone.top - height),
      left: chosenZone.left + getRandomValue(chosenZone.right - chosenZone.left - width),
    };
  };

  private getClosestValidPosition = ({ left, top, height, width }: ZoneParams) => {
    const closestFreeZone = getClosest({ left, top, items: this.freeZones });

    const topRange = {
      min: closestFreeZone.top,
      max: closestFreeZone.bottom - height,
      value: top,
    };
    const leftRange = {
      min: closestFreeZone.left,
      max: closestFreeZone.right - width,
      value: left,
    };

    return {
      top: isInRange(topRange) ? top : getClosestValueWithinRange(topRange),
      left: isInRange(leftRange) ? left : getClosestValueWithinRange(leftRange),
    };
  };

  public getPositionWithinBounds = ({
    top,
    left,
    width,
    height,
  }: Partial<Coordinates> & Dimensions) => {
    // if position isn't set yet, generate a new one
    if (!left || !top) {
      return this.getRandomPositionWithinBounds({ width, height });
    }

    // if out-of-bounds, find closest valid position
    if (!this.canGoToCoordinates({ top, left, width, height })) {
      return this.getClosestValidPosition({ left, top, height, width });
    }

    // item is already within the bounds
    return { left, top };
  };
}

export const globalPositionManager = new GlobalPositionManager({
  canvasWidth: window.innerWidth,
  canvasHeight: window.innerHeight,
});
