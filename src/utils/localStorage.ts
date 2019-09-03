import { ChickenBreed } from "../types/types";

export enum StorageKeys {
  chickens = "chickens",
}

interface StorageKeysType {
  [StorageKeys.chickens]: Record<ChickenBreed, number> | null;
}

const storageKeysToDefaultMap: { [key in StorageKeys]: StorageKeysType[key] } = {
  [StorageKeys.chickens]: null,
};

export const getStorageKey = (key: StorageKeys): StorageKeysType[StorageKeys] => {
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) {
      throw Error;
    }
    return JSON.parse(value);
  } catch {
    return storageKeysToDefaultMap[key];
  }
};

export const setStorageKey = (key: StorageKeys, value: StorageKeysType[StorageKeys]) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error("Not possible to set item", key, "in local storage");
  }
};

export const clearStorageKey = (key: StorageKeys) => {
  window.localStorage.removeItem(key);
};
