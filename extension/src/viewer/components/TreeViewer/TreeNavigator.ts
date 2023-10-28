import { RefObject } from "react";
import { VariableSizeTree as Tree } from "react-vtree";
import { NodePublicState, NodeRecord } from "react-vtree/dist/es/Tree";
import { RefCurrent } from "viewer/hooks";
import { JsonNodeData } from "./model/JsonNode";

export type JsonTree = Tree<JsonNodeData>;
export type JsonNodeRecord = NodeRecord<NodePublicState<JsonNodeData>>;

export type NavigationOffset = {
  rows?: number;
  pages?: number;
};

export class TreeNavigator {
  private tree: RefObject<JsonTree>;
  private treeElem: RefCurrent<HTMLElement>;
  private elemById: Map<string, HTMLElement> = new Map();
  private lastFocused?: string;

  constructor(
    tree: RefObject<Tree<JsonNodeData>>,
    treeElem: RefCurrent<HTMLElement>,
  ) {
    this.tree = tree;
    this.treeElem = treeElem;
  }

  onElemShown(id: string, elem: HTMLElement) {
    this.elemById.set(id, elem);

    // register to external focus event (e.g. by mouse click)
    elem.onfocus = () => (this.lastFocused = id);

    // handle pending navigation
    if (id === this.lastFocused) {
      elem.focus();
    }
  }

  onElemHidden(id: string) {
    this.elemById.delete(id);

    // return focus to parent to avoid inconsistencies
    if (id === this.lastFocused) {
      this.lastFocused = undefined;
      this.treeElem?.focus();
    }
  }

  canOpen(id: string): boolean {
    return !this.getNode(id)?.public?.data?.isLeaf;
  }

  isOpen(id: string): boolean {
    return this.getNode(id)?.public?.isOpen ?? false;
  }

  toogleOpen(id: string) {
    this.setOpen(id, !this.isOpen(id));
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

    // if already closed and it has a parent, then close the parent
    const parentId = this.getNode(id)?.parent?.public.data.id;
    if (parentId) {
      this.goto(parentId);
      this.setOpen(parentId, false);
    }
  }

  gotoOffset(id: string, { rows, pages }: NavigationOffset) {
    const index = this.order().indexOf(id);
    if (index >= 0) {
      const target = index + (rows ?? 0) + (pages ?? 0) * this.pageRows();
      this.gotoIndex(target);
    }
  }

  gotoFirst() {
    this.gotoIndex(0);
  }

  gotoLast() {
    this.gotoIndex(this.order().length - 1);
  }

  getCurrentId(): string | undefined {
    return this.lastFocused ? this.lastFocused : this.getId(0);
  }

  // O(N)
  goto(id: string) {
    // manually mark the node as focused, because
    // the target html element could be outside the virtual list
    this.lastFocused = id;

    this.tree.current?.scrollToItem(id);
    this.elemById.get(id)?.focus();
  }

  private gotoIndex(index: number) {
    const order = this.order();
    if (!order.length) return;

    index = Math.max(0, Math.min(index, order.length - 1));
    this.goto(order[index]);
  }

  private order(): string[] {
    return this.tree.current?.state.order ?? [];
  }

  private setOpen(id: string, state: boolean) {
    if (this.canOpen(id)) {
      this.getNode(id)?.public?.setOpen(state);
    }
  }

  private getNode(id: string): JsonNodeRecord | undefined {
    return this.tree.current?.state.records.get(id);
  }

  private getId(index: number): string | undefined {
    const order = this.order();
    if (0 <= index && index < order.length) {
      return order[index];
    }
  }

  private pageRows(): number {
    const pageHeight = this.treeElem?.clientHeight;
    const itemHeight =
      this.tree.current?.state?.list?.current?.props?.itemSize(0);
    return pageHeight && itemHeight ? Math.ceil(pageHeight / itemHeight) : 1;
  }
}
