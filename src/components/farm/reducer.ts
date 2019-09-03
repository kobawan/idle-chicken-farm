import React from "react";
import { FarmItems } from "../../types/types";
import {
  SetObjectsAction,
  AddFoodAction,
  SetChickensAction,
  ToggleFeedingAction,
  ToggleDraggingAction,
  FarmActions,
  RemoveFoodAction,
} from "./actions";

type AllFarmActions = (
  SetObjectsAction
  | AddFoodAction
  | RemoveFoodAction
  | SetChickensAction
  | ToggleFeedingAction
  | ToggleDraggingAction
);

interface FarmState extends FarmItems {
  isFeeding: boolean;
  isDragging: boolean;
}

export const initialFarmState: FarmState = {
  objects: [],
  food: [],
  chickens: [],
  isFeeding: false,
  isDragging: false,
};

type FarmReducerType = React.Reducer<FarmState, AllFarmActions>;

export const farmReducer: FarmReducerType = (state, action) => {
  switch (action.type) {
    case FarmActions.setChickens:
      return {
        ...state,
        chickens: action.payload.chickens,
      }
    case FarmActions.addFood:
      return {
        ...state,
        food: [
          ...state.food,
          action.payload.food,
        ],
      }
    case FarmActions.removeFood:
      return {
        ...state,
        food: state.food.filter(({ id }) => id !== action.payload.id),
      }
    case FarmActions.setObjects:
      return {
        ...state,
        objects: action.payload.objects,
      }
    case FarmActions.toggleDragging:
      return {
        ...state,
        isDragging: !state.isDragging,
      }
    case FarmActions.toggleFeeding:
      return {
        ...state,
        isFeeding: !state.isFeeding,
      }
    default:
      return state;
  }
};
