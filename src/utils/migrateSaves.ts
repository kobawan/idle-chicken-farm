import { ChickenBreed } from "../types/types";
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

export interface SavedChickenStateV2 {
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

export interface SavedFoodStateV2 {
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

const addDefaultVersion = () => {
  const version = getStorageKey(StorageKeys.version);

  if (!version) {
    setStorageKey(StorageKeys.version, GameSaveVersions.v1);
  }
};

const getVersion = (): GameSaveVersions => {
  return (getStorageKey(StorageKeys.version) as null | GameSaveVersions) || GameSaveVersions.v1;
};

const migrateV1toV2 = () => {
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

  setStorageKey(StorageKeys.chickens, migratedChickens);
  setStorageKey(StorageKeys.version, GameSaveVersions.v2);
};

export const initSave = () => {
  addDefaultVersion();
  migrateV1toV2();
};
