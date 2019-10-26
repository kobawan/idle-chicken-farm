import { InteractEvent } from "../types/types";

export const isTouchEvent = (e: InteractEvent<HTMLCanvasElement>): e is React.TouchEvent<HTMLCanvasElement> => {
  return (e as React.TouchEvent<HTMLCanvasElement>).type.includes("touch");
}

export const getInteractionPos = (e: InteractEvent<HTMLCanvasElement>) => {
  let left: number;
  let top: number;

  if(isTouchEvent(e)) {
    // ignore interactions with more than one finger
    if(e.touches.length !== 1) {
      return;
    }
    left = e.touches[0].clientX;
    top = e.touches[0].clientY;
  } else {
    left = e.clientX;
    top = e.clientY;
  }

  return { left, top };
}