import { RefCurrent } from "@/viewer/hooks";
import { VariableSizeList } from "react-window";
import { NodeId, NodeState } from "./NodeState";
import { ItemData } from "./TreeItem";
import { TreeState } from "./TreeState";

// context is any because it's not used in the handler
export type TreeListCurrent = RefCurrent<VariableSizeList<ItemData<any>>>;

const DEFAULT_ITEM_HEIGHT = 30;

export class TreeHandler {
  private tree: TreeState;
  private list: TreeListCurrent;
  private itemsHeight: Map<NodeId, number> = new Map();

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

  // Height

  public getHeight(id: NodeId): number {
    return this.itemsHeight.get(id) ?? DEFAULT_ITEM_HEIGHT;
  }

  public resize(id: NodeId, height: number) {
    this.itemsHeight.set(id, height);
    const index = this.tree.indexById(id);
    this.list?.resetAfterIndex(index, true);
  }

  // Navigation

  public scrollTo(id: NodeId) {
    const index = this.tree.indexById(id);
    this.list?.scrollToItem(index);
  }
}
