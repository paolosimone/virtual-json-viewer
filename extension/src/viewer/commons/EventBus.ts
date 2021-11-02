export enum EventType {
  Expand = "expand",
  Collapse = "collapse",
}

export function subscribe(event: EventType, listener: EventListener): void {
  document.addEventListener(event, listener);
}

export function unsubscribe(event: EventType, listener: EventListener): void {
  document.removeEventListener(event, listener);
}

export function dispatch(event: EventType): void {
  document.dispatchEvent(new Event(event));
}
