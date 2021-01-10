import { SAVING_INTERVAL } from "../../gameConfig";
import { setStorageKey, StorageKeys } from "./localStorage";

const saveItemsToStorage = (
  storageKey: StorageKeys,
  items: { getSavingState: () => unknown }[],
) => {
  const storage = items.map((item) => item.getSavingState());
  setStorageKey(storageKey, storage);
};

export const saveItemsOnInterval = (
  storageKey: StorageKeys,
  items: { getSavingState: () => unknown }[],
) => {
  const id = setInterval(() => saveItemsToStorage(storageKey, items), SAVING_INTERVAL);
  return () => {
    saveItemsToStorage(storageKey, items);
    clearInterval(id);
  };
};
