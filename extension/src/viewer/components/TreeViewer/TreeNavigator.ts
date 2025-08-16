import { RefCurrent } from "@/viewer/hooks";
import { NodeId, TreeHandler } from "./Tree";

export type NavigationOffset = {
  rows?: number;
  pages?: number;
};

export class TreeNavigator {
  private tree: RefCurrent<TreeHandler>;
  private treeElem: RefCurrent<HTMLElement>;

  // Nodes navigation
  private elemById: Map<NodeId, HTMLElement> = new Map();
  private lastFocused?: NodeId;

  constructor(
    tree: RefCurrent<TreeHandler>,
    treeElem: RefCurrent<HTMLElement>,
  ) {
    this.tree = tree;
    this.treeElem = treeElem;
  }

  // Nodes lifecycle

  public onElemShown(id: NodeId, elem: HTMLElement) {
    this.elemById.set(id, elem);

    // register to external focus event (e.g. by mouse click)
    elem.onfocus = () => (this.lastFocused = id);

    // handle pending navigation
    if (id === this.lastFocused) {
      elem.focus();
    }
  }

  public onElemHidden(id: NodeId) {
    this.elemById.delete(id);

    // return focus to parent to avoid inconsistencies
    if (id === this.lastFocused) {
      this.lastFocused = undefined;
      this.treeElem?.focus();
    }
  }

  public resize(id: NodeId, height: number) {
    this.tree?.resize(id, height);
  }

  // Openness

  public toggleOpen(id: NodeId) {
    this.tree?.setOpen(id, !this.tree?.isOpen(id));
  }

  public open(id: NodeId) {
    this.tree?.setOpen(id, true);
  }

  public close(id: NodeId) {
    if (this.tree?.isOpen(id)) {
      this.tree?.setOpen(id, false);
      return;
    }

    // if already closed and it has a parent, then close the parent
    const parentId = this.tree?.get(id).parent?.id;
    if (parentId !== undefined) {
      this.goto(parentId);
      this.close(parentId);
    }
  }

  // Nodes navigation

  public gotoOffset(id: NodeId, { rows, pages }: NavigationOffset) {
    const index = this.tree?.indexById(id);
    if (index !== undefined) {
      const target = index + (rows ?? 0) + (pages ?? 0) * this.pageRows();
      this.gotoIndex(target);
    }
  }

  public gotoFirst() {
    this.gotoIndex(0);
  }

  public gotoLast() {
    if (!this.tree?.length()) return;
    this.gotoIndex(this.tree.length() - 1);
  }

  public getCurrentId(): NodeId | undefined {
    if (this.lastFocused !== undefined) {
      return this.lastFocused;
    }

    if (this.tree?.length()) {
      return this.tree.getByIndex(0).id;
    }
  }

  public goto(id: NodeId) {
    // manually mark the node as focused, because
    // the target html element could be outside the virtual list
    this.lastFocused = id;

    this.tree?.scrollTo(id);
    this.elemById.get(id)?.focus();
  }

  private gotoIndex(index: number) {
    if (!this.tree?.length()) return;
    index = Math.max(0, Math.min(index, this.tree.length() - 1));
    const id = this.tree.getByIndex(index).id;
    this.goto(id);
  }

  private pageRows(): number {
    if (!this.tree?.length()) return 0;
    const pageHeight = this.treeElem?.clientHeight;
    const itemHeight = this.tree.getHeight(this.tree.getByIndex(0).id);
    return pageHeight && itemHeight ? Math.ceil(pageHeight / itemHeight) : 1;
  }

  // TODO Search navigation
}
