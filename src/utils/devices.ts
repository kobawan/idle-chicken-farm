import React from "react";
import { InteractEvent } from "../types/types";

export const isTouchEvent = (e: InteractEvent<HTMLElement>): e is React.TouchEvent<HTMLElement> => {
  return (e as React.TouchEvent<HTMLElement>).type.includes("touch");
};

export const isMultiFingerTouchEvent = (e: InteractEvent<HTMLElement>) => {
  return isTouchEvent(e) && e.touches.length !== 1;
};

export const getInteractionPos = (e: InteractEvent<HTMLElement>) => {
  let left: number;
  let top: number;

  if (isTouchEvent(e)) {
    left = e.touches[0].clientX;
    top = e.touches[0].clientY;
  } else {
    left = e.clientX;
    top = e.clientY;
  }

  return { left, top };
};
