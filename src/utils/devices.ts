import React from "react";
import { InteractEvent } from "../types/types";

export const isTouchEvent = (e: InteractEvent<HTMLElement>): e is React.TouchEvent<HTMLElement> => {
  return (e as React.TouchEvent<HTMLElement>).type.includes("touch");
};

export const getInteractionPos = (e: InteractEvent<HTMLElement>) => {
  let left: number;
  let top: number;

  if (isTouchEvent(e)) {
    // ignore interactions with more than one finger
    if (e.touches.length !== 1) {
      return;
    }
    left = e.touches[0].clientX;
    top = e.touches[0].clientY;
  } else {
    left = e.clientX;
    top = e.clientY;
  }

  return { left, top };
};
