import { Chicken } from "../models/chicken/chicken";
import { ChickenBreed } from "../types/types";
import { generateName, getAvailableNames } from "./chickenNameUtils";
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
  originalWidth: number;
  originalHeight: number;
  top: number;
  left: number;
  hungerMeter: number;
}

interface SavedFoodStateV2 {
  left: number;
  top: number;
  foodMeter: number;
  id: string;
  originalHeight: number;
  originalWidth: number;
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

const migrateV1toV2 = (width: number, height: number, sprite: HTMLImageElement) => {
  const version = getVersion();
  if (version !== GameSaveVersions.v1) {
    return;
  }
  const savedChickens = getStorageKey(StorageKeys.chickens) as SavedChickenStateV1[] | null;
  if (!savedChickens) {
    setStorageKey(StorageKeys.version, GameSaveVersions.v2);
    return;
  }

  const migratedChickens: SavedChickenStateV2[] = savedChickens.map(({ breed, ...rest }) => ({
    ...rest,
    breed: breed === "yellow" ? ChickenBreed.lightbrown : breed,
  }));
  const whiteChicken: SavedChickenStateV2 = new Chicken({
    width,
    height,
    breed: ChickenBreed.white,
    gender: "female",
    name: generateName("female", getAvailableNames(migratedChickens)),
    sprite,
  }).getSavingState();

  setStorageKey(StorageKeys.chickens, [...migratedChickens, whiteChicken]);
  setStorageKey(StorageKeys.version, GameSaveVersions.v2);
};

export const initSave = (width: number, height: number, sprite: HTMLImageElement) => {
  addDefaultVersion();
  migrateV1toV2(width, height, sprite);
};
