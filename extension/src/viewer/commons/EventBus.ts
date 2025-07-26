export enum EventType {
  Expand = "expand",
  Collapse = "collapse",
  SearchNavigatePrevious = "search-navigate-previous",
  SearchNavigateNext = "search-navigate-next",
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
