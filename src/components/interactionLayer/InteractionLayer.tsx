import React from "react";
import { InteractEvent } from "../../types/types";
import { isTouchEvent } from "../../utils/devices";
import { CustomEventEmitter } from "../../utils/EventEmitter";
import { EventName } from "../../utils/events";
import styles from "./interactionLayer.module.scss";

const onInteractStart = (e: InteractEvent<HTMLDivElement>) => {
  CustomEventEmitter.emit(EventName.StartDraggingFood, e);
};

const onInteractEnd = (e: InteractEvent<HTMLDivElement>) => {
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
