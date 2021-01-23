import { Chicken } from "../../models/chicken/chicken";
import { ChickenBreed } from "../../types/types";
import { generateName, getAvailableNames } from "../chickenNameUtils";
import { getStorageKey, setStorageKey, StorageKeys } from "./localStorage";

export interface SavedChickenStateV1 {
  name: string;
  gender: "male" | "female";
  id: string;
  breed: ChickenBreed.brown | "yellow" | ChickenBreed.orange;
  originalWidth: number;
  originalHeight: number;
  top: number;
  left: number;
  hungerMeter: number;
}

interface SavedChickenStateV2 {
  name: string;
  gender: "male" | "female";
  id: string;
  breed: ChickenBreed.brown | ChickenBreed.lightbrown | ChickenBreed.orange | ChickenBreed.white;
  topRatio: number;
  leftRatio: number;
  hungerMeter: number;
}

interface SavedFoodStateV1 {
  left: number;
  top: number;
  foodMeter: number;
  id: string;
  originalHeight: number;
  originalWidth: number;
}

interface SavedFoodStateV2 {
  leftRatio: number;
  topRatio: number;
  foodMeter: number;
  id: string;
}

enum GameSaveVersions {
  v1 = "v1",
  v2 = "v2",
}

// These should always be updated to latest version
export type SavedChickenState = SavedChickenStateV2;
export type SavedFoodState = SavedFoodStateV2;
const LATEST_VERSION = GameSaveVersions.v2;

const addDefaultVersion = () => {
  const version = getStorageKey(StorageKeys.version);
  const chickens = getStorageKey(StorageKeys.chickens);

  // For new players
  if (!chickens) {
    setStorageKey(StorageKeys.version, LATEST_VERSION);
    return;
  }

  // For version one compatibility
  if (!version) {
    setStorageKey(StorageKeys.version, GameSaveVersions.v1);
  }
};

const getVersion = (): GameSaveVersions => {
  return (getStorageKey(StorageKeys.version) as null | GameSaveVersions) || GameSaveVersions.v1;
};

const migrateChickensV1toV2 = (
  canvasWidth: number,
  canvasHeight: number,
  sprite: HTMLImageElement,
) => {
  const savedChickens = getStorageKey(StorageKeys.chickens) as SavedChickenStateV1[] | null;
  if (!savedChickens || !savedChickens.length) {
    return;
  }

  const migratedChickens: SavedChickenStateV2[] = savedChickens.map(
    ({ breed, originalWidth, originalHeight, top, left, ...rest }) => ({
      ...rest,
      topRatio: top / canvasHeight,
      leftRatio: left / canvasWidth,
      breed: breed === "yellow" ? ChickenBreed.lightbrown : breed,
    }),
  );
  const whiteChicken: SavedChickenStateV2 = new Chicken({
    canvasWidth,
    canvasHeight,
    breed: ChickenBreed.white,
    gender: "female",
    name: generateName("female", getAvailableNames(migratedChickens)),
    sprite,
  }).getSavingState();

  setStorageKey(StorageKeys.chickens, [...migratedChickens, whiteChicken]);
};

const migrateFoodV1toV2 = (canvasWidth: number, canvasHeight: number) => {
  const savedFood = getStorageKey(StorageKeys.food) as SavedFoodStateV1[] | null;

  if (!savedFood || !savedFood.length) {
    return;
  }

  const migratedFood: SavedFoodStateV2[] = savedFood.map(
    ({ originalHeight, originalWidth, left, top, ...rest }) => ({
      ...rest,
      leftRatio: left / canvasWidth,
      topRatio: top / canvasHeight,
    }),
  );

  setStorageKey(StorageKeys.food, migratedFood);
};

const migrateV1toV2 = (canvasWidth: number, canvasHeight: number, sprite: HTMLImageElement) => {
  const version = getVersion();
  if (version !== GameSaveVersions.v1) {
    return;
  }
  migrateChickensV1toV2(canvasWidth, canvasHeight, sprite);
  migrateFoodV1toV2(canvasWidth, canvasHeight);

  setStorageKey(StorageKeys.version, GameSaveVersions.v2);
};

export const initSave = (canvasWidth: number, canvasHeight: number, sprite: HTMLImageElement) => {
  addDefaultVersion();
  migrateV1toV2(canvasWidth, canvasHeight, sprite);
};
