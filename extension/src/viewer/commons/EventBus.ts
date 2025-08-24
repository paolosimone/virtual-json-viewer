import * as Json from "@/viewer/commons/Json";

export enum ViewerEventType {
  Expand = "expand",
  Collapse = "collapse",
  SearchNavigatePrevious = "search-navigate-previous",
  SearchNavigateNext = "search-navigate-next",
  EnterNode = "enter-node",
}

export interface ViewerEvent extends Event {}

export type NodePath = Json.Key[];

export class EnterNodeEvent extends Event implements ViewerEvent {
  constructor(public path: Json.Key[]) {
    super(ViewerEventType.EnterNode);
  }
}

export type ViewerComplexEventType = ViewerEventType.EnterNode;

export type ViewerSimpleEventType = Exclude<
  ViewerEventType,
  ViewerComplexEventType
>;

interface ViewerComplexEventMap {
  [ViewerEventType.EnterNode]: EnterNodeEvent;
}

export type ViewerEventListener<K extends ViewerEventType> = (
  event: K extends ViewerComplexEventType
    ? ViewerComplexEventMap[K]
    : undefined,
) => void;

export function subscribe<K extends ViewerEventType>(
  type: K,
  listener: ViewerEventListener<K>,
): void {
  document.addEventListener(type, listener as EventListener);
}

export function unsubscribe<K extends ViewerEventType>(
  type: K,
  listener: ViewerEventListener<K>,
): void {
  document.removeEventListener(type, listener as EventListener);
}

export function dispatch(event: ViewerSimpleEventType | ViewerEvent): void {
  if (typeof event === "string") {
    event = new Event(event);
  }
  document.dispatchEvent(event);
}
