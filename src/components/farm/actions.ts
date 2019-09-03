import { StaticObject } from "../../utils/staticObject";
import { Chicken } from "../../utils/chicken";

export enum FarmActions {
  setObjects,
  addFood,
  removeFood,
  setChickens,
  toggleFeeding,
  toggleDragging,
}

interface ActionType<T> {
  type: T;
}

interface ActionWithPayloadType<T, P> extends ActionType<T> {
  payload: P;
}

export type SetObjectsAction = ActionWithPayloadType<FarmActions.setObjects, { objects: StaticObject[] }>;
export type AddFoodAction = ActionWithPayloadType<FarmActions.addFood, { food: StaticObject }>;
export type RemoveFoodAction = ActionWithPayloadType<FarmActions.removeFood, { id: number }>;
export type SetChickensAction = ActionWithPayloadType<FarmActions.setChickens, { chickens: Chicken[] }>;
export type ToggleFeedingAction = ActionType<FarmActions.toggleFeeding>;
export type ToggleDraggingAction = ActionType<FarmActions.toggleDragging>;

export const setObjectsAction = (objects: StaticObject[]): SetObjectsAction => ({
  type: FarmActions.setObjects,
  payload: { objects },
});

export const addFoodAction = (food: StaticObject): AddFoodAction => ({
  type: FarmActions.addFood,
  payload: { food },
});

export const removeFoodAction = (id: number): RemoveFoodAction => ({
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
