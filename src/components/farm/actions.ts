import { StaticObject } from "../../utils/staticObject";
import { Chicken } from "../../utils/chicken";
import { Food } from "../../utils/food";

export enum FarmActions {
  setObjects,
  addFood,
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

export type SetObjectsAction = ActionWithPayloadType<FarmActions.setObjects, { objects: StaticObject[] }>;
export type AddFoodAction = ActionWithPayloadType<FarmActions.addFood, { food: Food }>;
export type RemoveFoodAction = ActionWithPayloadType<FarmActions.removeFood, { id: string }>;
export type SetChickensAction = ActionWithPayloadType<FarmActions.setChickens, { chickens: Chicken[] }>;
export type ToggleFeedingAction = ActionType<FarmActions.toggleFeeding>;
export type ToggleDraggingAction = ActionType<FarmActions.toggleDragging>;
export type ToggleInfoAction = ActionType<FarmActions.toggleInfo>;

export const setObjectsAction = (objects: StaticObject[]): SetObjectsAction => ({
  type: FarmActions.setObjects,
  payload: { objects },
});

export const addFoodAction = (food: Food): AddFoodAction => ({
  type: FarmActions.addFood,
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
