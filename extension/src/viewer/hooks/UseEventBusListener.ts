import { useEffect } from "react";
import { EventType, subscribe, unsubscribe } from "../commons/EventBus";

export function useEventBusListener(
  event: EventType,
  listener: EventListener,
): void {
  useEffect(() => {
    subscribe(event, listener);
    return () => unsubscribe(event, listener);
  }, [event, listener]);
}
