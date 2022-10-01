import { RefObject } from "react";
import { VariableSizeTree as Tree } from "react-vtree";
import { NodePublicState, NodeRecord } from "react-vtree/dist/es/Tree";
import { JsonNodeData } from "./model/JsonNode";

export type JsonTree = Tree<JsonNodeData>;
export type JsonNodeRecord = NodeRecord<NodePublicState<JsonNodeData>>;

export class TreeNavigator {
  private tree: RefObject<JsonTree>;
  private elemById: Map<string, HTMLElement> = new Map();
  private lastFocused?: string;
  private pendingFocus?: string;

  constructor(tree: RefObject<Tree<JsonNodeData>>) {
    this.tree = tree;
  }

  onElemShown(id: string, elem: HTMLElement) {
    this.elemById.set(id, elem);

    elem.onfocus = () => (this.lastFocused = id);

    if (id === this.pendingFocus) {
      this.focusElem(id);
    }
  }

  onElemHidden(id: string) {
    this.elemById.delete(id);
  }

  get(id: string): JsonNodeRecord | undefined {
    return this.tree.current?.state.records.get(id);
  }

  canOpen(id: string): boolean {
    return !this.get(id)?.public?.data?.isLeaf;
  }

  isOpen(id: string): boolean {
    return this.get(id)?.public?.isOpen ?? false;
  }

  setOpen(id: string, state: boolean) {
    if (this.canOpen(id)) {
      this.get(id)?.public?.setOpen(state);
    }
  }

  toogleOpen(id: string) {
    if (this.canOpen(id)) {
      this.setOpen(id, !this.isOpen(id));
    }
  }

  gotoNext(id: string) {
    const order = this.order();
    const index = order.indexOf(id);
    if (0 <= index && index < order.length - 1) {
      this.goto(order[index + 1]);
    }
  }

  gotoPrevious(id: string) {
    const order = this.order();
    const index = order.indexOf(id);
    if (index > 0) {
      this.goto(order[index - 1]);
    }
  }

  // O(N)
  goto(id: string) {
    this.tree.current?.scrollToItem(id);
    this.focusElem(id);
  }

  gotoLastFocused() {
    // if no node has ever been selected, goto first
    if (!this.lastFocused && this.order().length) {
      this.lastFocused = this.order()[0];
    }
    if (this.lastFocused) {
      this.goto(this.lastFocused);
    }
  }

  private focusElem(id: string) {
    const elem = this.elemById.get(id);

    if (!elem) {
      // the html element is outside the virtual list
      this.pendingFocus = id;
      return;
    }

    this.pendingFocus = undefined;
    elem.focus();
  }

  private order(): string[] {
    return this.tree.current?.state.order ?? [];
  }
}
