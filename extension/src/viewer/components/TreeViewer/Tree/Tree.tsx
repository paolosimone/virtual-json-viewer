import { useReactiveRef } from "@/viewer/hooks";
import {
  JSX,
  Ref,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { VariableSizeList } from "react-window";
import { TreeWalker } from "../TreeWalker";
import { TreeHandler } from "./TreeHandler";
import { ItemData, TreeItem } from "./TreeItem";
import { TreeNodeComponent } from "./TreeNodeComponent";
import { TreeState } from "./TreeState";

export type TreeProps<Context> = {
  height: number;
  width: number;
  treeWalker: TreeWalker;
  context: Context;
  children: TreeNodeComponent<Context>;
  ref?: Ref<TreeHandler>;
  outerRef?: Ref<HTMLDivElement>;
};

export function Tree<Context>({
  height,
  width,
  treeWalker,
  context,
  children: TreeNode,
  ref,
  outerRef,
}: TreeProps<Context>): JSX.Element {
  // TreeState is a reference to the mutable state of the tree.
  // The reference gets updated whenever the state changes to trigger reactive updates.
  // The underlying data structure is mutable, so any reference points to the latest state.
  const [treeState, setTreeState] = useState<TreeState>(() => new TreeState());
  useEffect(() => treeState.observeStateChange(setTreeState), []);
  useEffect(() => treeState.load(treeWalker), [treeWalker]);

  // Reference to the list component
  const [list, listRef] = useReactiveRef<VariableSizeList<ItemData<Context>>>();

  // Expose an handler to manipulate the tree from outside.
  // The handler reference is updated when the tree content is (re)loaded.
  const [handler, setHandler] = useState<TreeHandler>(
    () => new TreeHandler(treeState, list),
  );
  useEffect(
    () => setHandler(new TreeHandler(treeState, list)),
    [treeWalker, list],
  );
  useImperativeHandle(ref, () => handler, [handler]);

  const itemData: ItemData<Context> = useMemo(
    () => ({ treeState, context, TreeNode }),
    [treeState, context, TreeNode],
  );

  return (
    <VariableSizeList<ItemData<Context>>
      ref={listRef}
      outerRef={outerRef}
      height={height}
      width={width}
      itemCount={itemData.treeState.length()}
      itemData={itemData}
      itemKey={(index, itemData) => itemData.treeState.idByIndex(index)}
      itemSize={(index) => handler.getHeight(treeState.idByIndex(index))}
      overscanCount={20}
    >
      {TreeItem}
    </VariableSizeList>
  );
}
