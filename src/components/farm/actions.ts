import { Item } from "../../models/item";
import { Chicken } from "../../models/chicken/chicken";
import { Food } from "../../models/food";

export enum FarmActions {
  setItems,
  addFood,
  setFood,
  removeFood,
  setChickens,
  toggleFeeding,
  toggleDragging,
  toggleInfo,
}

interface ActionType<T> {
  type: T;
}

interface ActionWithPayloadType<T, P> extends ActionType<T> {
  payload: P;
}

export type SetItemsAction = ActionWithPayloadType<FarmActions.setItems, { items: Item[] }>;
export type AddFoodAction = ActionWithPayloadType<FarmActions.addFood, { food: Food }>;
export type SetFoodAction = ActionWithPayloadType<FarmActions.setFood, { food: Food[] }>;
export type RemoveFoodAction = ActionWithPayloadType<FarmActions.removeFood, { id: string }>;
export type SetChickensAction = ActionWithPayloadType<
  FarmActions.setChickens,
  { chickens: Chicken[] }
>;
export type ToggleFeedingAction = ActionType<FarmActions.toggleFeeding>;
export type ToggleDraggingAction = ActionType<FarmActions.toggleDragging>;
export type ToggleInfoAction = ActionType<FarmActions.toggleInfo>;

export const setItemsAction = (items: Item[]): SetItemsAction => ({
  type: FarmActions.setItems,
  payload: { items },
});

export const addFoodAction = (food: Food): AddFoodAction => ({
  type: FarmActions.addFood,
  payload: { food },
});

export const setFoodAction = (food: Food[]): SetFoodAction => ({
  type: FarmActions.setFood,
  payload: { food },
});

export const removeFoodAction = (id: string): RemoveFoodAction => ({
  type: FarmActions.removeFood,
  payload: { id },
});

export const setChickensAction = (chickens: Chicken[]): SetChickensAction => ({
  type: FarmActions.setChickens,
  payload: { chickens },
});

export const toggleFeedingAction = (): ToggleFeedingAction => ({
  type: FarmActions.toggleFeeding,
});

export const toggleDraggingAction = (): ToggleDraggingAction => ({
  type: FarmActions.toggleDragging,
});

export const toggleInfoAction = (): ToggleInfoAction => ({
  type: FarmActions.toggleInfo,
});
