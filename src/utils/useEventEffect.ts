import { useEffect } from "react"
import { CustomEventEmitter } from "./EventEmitter"
import { EventName } from "./events"

export const useEventEffect = (eventName: EventName, cb: (...args: any[]) => void) => {
  useEffect(() => {
    CustomEventEmitter.on(eventName, cb)
    return () => { CustomEventEmitter.off(eventName, cb) }
  }, [eventName, cb])
}
