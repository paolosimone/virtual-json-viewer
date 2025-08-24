import { useEffect } from "react";
import {
  ViewerEventListener,
  ViewerEventType,
  subscribe,
  unsubscribe,
} from "../commons/EventBus";

export function useEventBusListener<K extends ViewerEventType>(
  event: K,
  listener: ViewerEventListener<K>,
): void {
  useEffect(() => {
    subscribe(event, listener);
    return () => unsubscribe(event, listener);
  }, [event, listener]);
}
