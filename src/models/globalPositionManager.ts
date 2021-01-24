import { FOOD_MAX_DISTANCE_PX, RESIZE_BY } from "../gameConfig";
import { Coordinates } from "../types/types";
import { getDistance, getClosest } from "../utils/distance";
import { getCoopProps, getTroughProps } from "../utils/drawItems";
import { getFenceBoundaries } from "../utils/fenceUtils";
import { getRandomValue, getValueWithinRange, isInRange } from "../utils/math";
import { spriteCoordinatesMap } from "../utils/spriteCoordinates";
import { Food } from "./food";

// Chickens take priority
const chickenSprite = spriteCoordinatesMap.chicken.brown.default;
const BOUNDS_PADDING = {
  ...chickenSprite,
  height: chickenSprite.height * RESIZE_BY,
  width: chickenSprite.width * RESIZE_BY,
};

interface GlobalPositionManagerProps {
  canvasWidth: number;
  canvasHeight: number;
}

interface Zone {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

class GlobalPositionManager {
  private canvasHeight!: number;
  private canvasWidth!: number;

  private get noGoZones(): Zone[] {
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
        bottom: this.noGoZones[0].top - BOUNDS_PADDING.height,
      },
      {
        left: this.gameBoundaries.left,
        top: this.noGoZones[0].top - BOUNDS_PADDING.height,
        right: this.noGoZones[0].left - BOUNDS_PADDING.width,
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
        bottom: this.noGoZones[0].top - BOUNDS_PADDING.height,
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
        bottom: this.noGoZones[1].top - BOUNDS_PADDING.height,
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

  public canGoToZone({ left, top }: { left: number; top: number }) {
    return this.freeZones.find((zone) => {
      return (
        isInRange({ value: left, min: zone.left, max: zone.right }) &&
        isInRange({ value: top, min: zone.top, max: zone.bottom })
      );
    });
  }

  public getPositionWithinBounds = ({ top, left }: { top?: number; left?: number }) => {
    if (!left || !top) {
      const randIndex = getRandomValue(this.freeZones.length - 1);
      const chosenZone = this.freeZones[randIndex];

      return {
        top: chosenZone.top + getRandomValue(chosenZone.bottom - chosenZone.top),
        left: chosenZone.left + getRandomValue(chosenZone.right - chosenZone.left),
      };
    }

    const currentFreeZone = this.freeZones.find((zone) => {
      return (
        isInRange({ value: left, min: zone.left, max: zone.right }) &&
        isInRange({ value: top, min: zone.top, max: zone.bottom })
      );
    });

    // if in no-go zone, find closest free zone
    if (!currentFreeZone) {
      const closestFreeZone = getClosest({ left, top, items: this.freeZones });

      return {
        top: getValueWithinRange({
          min: closestFreeZone.top,
          max: closestFreeZone.bottom,
          value: top,
        }),
        left: getValueWithinRange({
          min: closestFreeZone.left,
          max: closestFreeZone.right,
          value: left,
        }),
      };
    }

    return { left, top };
  };
}

export const globalPositionManager = new GlobalPositionManager({
  canvasWidth: window.innerWidth,
  canvasHeight: window.innerHeight,
});
