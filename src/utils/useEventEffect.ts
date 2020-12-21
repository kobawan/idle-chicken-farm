import { useEffect } from "react";
import { CustomEventEmitter } from "./EventEmitter";
import { EventName } from "./events";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useEventEffect = (eventName: EventName, cb: (...args: any[]) => void) => {
  useEffect(() => {
    CustomEventEmitter.on(eventName, cb);
    return () => {
      CustomEventEmitter.off(eventName, cb);
    };
  }, [eventName, cb]);
};
