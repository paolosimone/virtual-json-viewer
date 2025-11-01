import { RefCurrent } from "@/viewer/hooks";
import { Align, ListImperativeAPI } from "react-window";
import { NodeId, NodeState } from "./NodeState";
import { TreeState } from "./TreeState";

// context is any because it's not used in the handler
export type TreeListCurrent = RefCurrent<ListImperativeAPI>;

export class TreeHandler {
  private tree: TreeState;
  private list: TreeListCurrent;

  constructor(tree: TreeState, list: TreeListCurrent) {
    this.tree = tree;
    this.list = list;
  }

  // Accessors

  public length(): number {
    return this.tree.length();
  }

  public getByIndex(index: number): NodeState {
    return this.tree.nodeByIndex(index);
  }

  public indexById(id: NodeId): number {
    return this.tree.indexById(id);
  }

  public get(id: NodeId): NodeState {
    return this.tree.nodeById(id);
  }

  public iterAll(): Generator<NodeState> {
    return this.tree.iterAll();
  }

  // Openness

  public isOpen(id: NodeId): boolean {
    return this.get(id).isOpen;
  }

  public setOpen(id: NodeId, isOpen: boolean) {
    this.tree.setOpen(id, isOpen);
  }

  public openAll() {
    this.tree.openAll();
  }

  public closeAll() {
    this.tree.closeAll();
  }

  // Navigation

  public scrollTo(id: NodeId, align?: Align) {
    const index = this.tree.indexById(id);
    if (0 <= index && index < this.tree.length()) {
      this.list?.scrollToRow({ index, align });
    }
  }
}
