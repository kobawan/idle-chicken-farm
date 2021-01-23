import { FOOD_MAX_DISTANCE_PX, RESIZE_BY } from "../gameConfig";
import { Coordinates } from "../types/types";
import { getDistance, getClosest } from "../utils/distance";
import { getCoopProps, getTroughProps } from "../utils/drawItems";
import { getFenceBoundaries } from "../utils/fenceUtils";
import { isInRange } from "../utils/math";
import { Food } from "./food";

interface PositionManagerProps {
  canvasWidth: number;
  canvasHeight: number;
}

interface Zone {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

class PositionManager {
  private hasInitialised = false;
  private noGoZones!: Zone[];
  private gameBoundaries!: Zone;
  private canvasHeight!: number;
  private canvasWidth!: number;

  public init({ canvasHeight, canvasWidth }: PositionManagerProps) {
    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;

    this.noGoZones = this.getNoGoZones();
    this.gameBoundaries = getFenceBoundaries(this.canvasWidth, this.canvasHeight);
    this.hasInitialised = true;
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

  public canGoToZone({
    left,
    top,
    width,
    height,
  }: {
    left: number;
    top: number;
    width: number;
    height: number;
  }) {
    this.checkForInit();

    const realWidth = width * RESIZE_BY;
    const realHeight = height * RESIZE_BY;

    const isWithinGameBounds =
      isInRange({
        value: left,
        min: this.gameBoundaries.left,
        max: this.gameBoundaries.right - realWidth,
      }) &&
      isInRange({
        value: top,
        min: this.gameBoundaries.top,
        max: this.gameBoundaries.bottom - realHeight,
      });

    const isInAnyNoGoZone = this.noGoZones.some((zone) => {
      return (
        isInRange({ value: left, min: zone.left - realWidth, max: zone.right }) &&
        isInRange({ value: top, min: zone.top - realHeight, max: zone.bottom })
      );
    });

    return isWithinGameBounds && !isInAnyNoGoZone;
  }

  private checkForInit() {
    if (!this.hasInitialised) {
      throw new Error("Position manager has not been initialised!");
    }
  }

  private getNoGoZones() {
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

    return [coopZone, troughZone];
  }
}

export const positionManager = new PositionManager();
