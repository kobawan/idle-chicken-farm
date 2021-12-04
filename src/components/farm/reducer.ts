import React from "react";
import { FarmItems } from "../../types/types";
import {
  AddFoodAction,
  SetChickensAction,
  ToggleFeedingAction,
  ToggleDraggingAction,
  FarmActions,
  RemoveFoodAction,
  ToggleInfoAction,
  SetFoodAction,
} from "./actions";

export type AllFarmActions =
  | AddFoodAction
  | SetFoodAction
  | RemoveFoodAction
  | SetChickensAction
  | ToggleFeedingAction
  | ToggleDraggingAction
  | ToggleInfoAction;

export interface FarmState extends FarmItems {
  isFeeding: boolean;
  isDragging: boolean;
  isInfoOpen: boolean;
}

export const initialFarmState: FarmState = {
  food: [],
  chickens: [],
  isFeeding: false,
  isDragging: false,
  isInfoOpen: false,
};

type FarmReducerType = React.Reducer<FarmState, AllFarmActions>;

export const farmReducer: FarmReducerType = (state, action) => {
  switch (action.type) {
    case FarmActions.setChickens:
      return {
        ...state,
        chickens: action.payload.chickens,
      };
    case FarmActions.setFood: {
      return {
        ...state,
        food: action.payload.food,
      };
    }
    case FarmActions.addFood:
      return {
        ...state,
        food: [...state.food, action.payload.food],
      };
    case FarmActions.removeFood:
      return {
        ...state,
        food: state.food.filter(({ id }) => id !== action.payload.id),
      };
    case FarmActions.toggleDragging:
      return {
        ...state,
        isDragging: !state.isDragging,
      };
    case FarmActions.toggleFeeding:
      return {
        ...state,
        isFeeding: !state.isFeeding,
      };
    case FarmActions.toggleInfo:
      return {
        ...state,
        isInfoOpen: !state.isInfoOpen,
      };
    default:
      return state;
  }
};
