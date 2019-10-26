import { setStorageKey, StorageKeys } from "./localStorage";

const SAVING_INTERVAL = 5000;

const saveItemsToStorage = (storageKey: StorageKeys, items: { getSavingState: () => any }[]) => {
  const storage = items.map(item => item.getSavingState());
  if (!storage.length) {
    return;
  }
  setStorageKey(storageKey, storage);
}

export const saveItemsOnInterval = (storageKey: StorageKeys, items: { getSavingState: () => any }[]) => {
  const id = setInterval(() => saveItemsToStorage(storageKey, items), SAVING_INTERVAL);
  return () => {
    saveItemsToStorage(storageKey, items);
    clearInterval(id);
  };
}
