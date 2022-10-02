import { RefObject } from "react";
import { VariableSizeTree as Tree } from "react-vtree";
import { NodePublicState, NodeRecord } from "react-vtree/dist/es/Tree";
import { RefCurrent } from "viewer/hooks";
import { JsonNodeData } from "./model/JsonNode";

export type JsonTree = Tree<JsonNodeData>;
export type JsonNodeRecord = NodeRecord<NodePublicState<JsonNodeData>>;

export class TreeNavigator {
  private tree: RefObject<JsonTree>;
  private treeElem: RefCurrent<HTMLElement>;
  private elemById: Map<string, HTMLElement> = new Map();
  private lastFocused?: string;
  private pendingFocus?: string;

  constructor(
    tree: RefObject<Tree<JsonNodeData>>,
    treeElem: RefCurrent<HTMLElement>
  ) {
    this.tree = tree;
    this.treeElem = treeElem;
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

    if (id === this.lastFocused) {
      this.lastFocused = undefined;
      this.treeElem?.focus();
    }
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

  open(id: string) {
    if (!this.isOpen(id)) {
      this.setOpen(id, true);
    }
  }

  close(id: string) {
    if (this.isOpen(id)) {
      this.setOpen(id, false);
      return;
    }

    const parentId = this.get(id)?.parent?.public.data.id;
    if (parentId) {
      this.goto(parentId);
      this.setOpen(parentId, false);
    }
  }

  toogleOpen(id: string) {
    this.setOpen(id, !this.isOpen(id));
  }

  gotoNext(id: string) {
    const index = this.order().indexOf(id);
    if (index >= 0) {
      this.gotoIndex(index + 1);
    }
  }

  gotoPrevious(id: string) {
    const index = this.order().indexOf(id);
    this.gotoIndex(index - 1);
  }

  // O(N)
  goto(id: string) {
    this.tree.current?.scrollToItem(id);
    this.focusElem(id);
  }

  gotoFirst() {
    this.gotoIndex(0);
  }

  gotoLast() {
    this.gotoIndex(this.order().length - 1);
  }

  gotoLastFocused() {
    if (this.lastFocused) {
      this.goto(this.lastFocused);
    } else {
      this.gotoFirst();
    }
  }

  private gotoIndex(index: number) {
    const order = this.order();
    if (0 <= index && index < order.length) {
      this.goto(order[index]);
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

  private setOpen(id: string, state: boolean) {
    if (this.canOpen(id)) {
      this.get(id)?.public?.setOpen(state);
    }
  }
}
