import { useEffect } from "react";
import { SAVING_INTERVAL } from "../../gameConfig";
import { setStorageKey, StorageKeys } from "./localStorage";

const saveItemsToStorage = (
  storageKey: StorageKeys,
  items: { getSavingState: () => unknown }[],
) => {
  const storage = items.map((item) => item.getSavingState());
  setStorageKey(storageKey, storage);
};

export const useAutoSaveEffect = ({
  storageKey,
  items,
  canvasHeight,
  canvasWidth,
}: {
  storageKey: StorageKeys;
  items: { getSavingState: () => unknown }[];
  canvasWidth: number;
  canvasHeight: number;
}) => {
  useEffect(() => {
    const id = setInterval(() => saveItemsToStorage(storageKey, items), SAVING_INTERVAL);
    return () => {
      saveItemsToStorage(storageKey, items);
      clearInterval(id);
    };
  }, [storageKey, items, canvasHeight, canvasWidth]);
};
