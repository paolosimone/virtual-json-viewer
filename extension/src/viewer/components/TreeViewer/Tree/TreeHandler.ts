import { RefObject } from "react";
import { VariableSizeList } from "react-window";
import { ItemData } from "./TreeItem";
import { TreeState } from "./TreeState";

// context is any because it's not used in the handler,
// this also avoids circular dependencies
export type TreeListRef = RefObject<Nullable<VariableSizeList<ItemData<any>>>>;

const DEFAULT_ITEM_HEIGHT = 30;

export class TreeHandler {
  private list: TreeListRef;
  private tree: TreeState = new TreeState();
  private itemsHeight: Map<string, number> = new Map();

  constructor(list: TreeListRef) {
    this.list = list;
  }

  public updateState(tree: TreeState) {
    this.tree = tree;
  }

  public canOpen(id: string): boolean {
    return !this.tree.nodeById(id).isLeaf;
  }

  public isOpen(id: string): boolean {
    return this.tree.nodeById(id).isOpen;
  }

  public setOpen(id: string, isOpen: boolean) {
    this.tree.setOpen(id, isOpen);
  }

  public getHeight(id: string): number {
    return this.itemsHeight.get(id) ?? DEFAULT_ITEM_HEIGHT;
  }

  public resize(id: string, height: number) {
    this.itemsHeight.set(id, height);
    const index = this.tree.indexById(id);
    this.list.current?.resetAfterIndex(index, true);
  }
}
