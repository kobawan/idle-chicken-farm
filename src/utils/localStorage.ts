export enum StorageKeys {
  chickens = "chickens",
  food = "food",
}

const storageKeysToDefaultMap: { [key in StorageKeys]: unknown } = {
  [StorageKeys.chickens]: null,
  [StorageKeys.food]: null,
};

export const getStorageKey = (key: StorageKeys): unknown => {
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

export const setStorageKey = (key: StorageKeys, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error("Not possible to set item", key, "in local storage");
  }
};

export const clearStorageKey = (key: StorageKeys) => {
  window.localStorage.removeItem(key);
};
