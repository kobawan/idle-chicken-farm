import React from "react";
import { InteractEvent } from "../../types/types";
import { isTouchEvent } from "../../utils/devices";
import { CustomEventEmitter } from "../../utils/eventUtils/EventEmitter";
import { EventName } from "../../utils/eventUtils/events";
import { TOGGLE_FEEDING_BTN_ID } from "../menu/consts";
import styles from "./interactionLayer.module.scss";

const onInteractStart = (e: InteractEvent<HTMLDivElement>) => {
  if ((e.target as HTMLElement).id === TOGGLE_FEEDING_BTN_ID) {
    return;
  }
  CustomEventEmitter.emit(EventName.StartDraggingFood, e);
};

const onInteractEnd = (e: InteractEvent<HTMLDivElement>) => {
  if ((e.target as HTMLElement).id === TOGGLE_FEEDING_BTN_ID) {
    return;
  }
  CustomEventEmitter.emit(EventName.StopDraggingFood, e);
};

const onInteractMove = (e: InteractEvent<HTMLDivElement>) => {
  CustomEventEmitter.emit(EventName.DropFood, e);

  if (!isTouchEvent(e)) {
    CustomEventEmitter.emit(EventName.DetectTooltip, e);
  }
};

export const InteractionLayer: React.FC = ({ children }) => {
  return (
    <div
      className={styles.container}
      onTouchStart={onInteractStart}
      onTouchEnd={onInteractEnd}
      onTouchMove={onInteractMove}
      onMouseDown={onInteractStart}
      onMouseUp={onInteractEnd}
      onMouseMove={onInteractMove}
    >
      {children}
    </div>
  );
};
