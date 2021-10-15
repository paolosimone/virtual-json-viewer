export enum EventType {
  Expand = "expand",
  Collapse = "collapse",
}

export function subscribe(event: EventType, listener: EventListener) {
  document.addEventListener(event, listener);
}

export function unsubscribe(event: EventType, listener: EventListener) {
  document.removeEventListener(event, listener);
}

export function dispatch(event: EventType) {
  document.dispatchEvent(new Event(event));
}
