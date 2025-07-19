import {
  JSX,
  Ref,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
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
  // Bind the tree state to the treeWalker
  const [treeState, setTreeState] = useState<TreeState>(() => new TreeState());
  useEffect(() => treeState.observeStateChange(setTreeState), []);
  useEffect(() => treeState.load(treeWalker), [treeWalker]);

  // Reference to the list component
  const listRef = useRef<VariableSizeList<ItemData<Context>>>(null);

  // Expose an handler to manipulate the tree from outside
  const handler = useRef<TreeHandler>(new TreeHandler(listRef));
  useEffect(() => handler.current.updateState(treeState), [treeState]);
  useImperativeHandle(ref, () => handler.current, [handler]);

  const itemData: ItemData<Context> = useMemo(
    () => ({ treeState, context, TreeNode }),
    [treeState, context, TreeNode],
  );

  return (
    // react-window is not able to infer the type from generics
    <VariableSizeList
      ref={listRef as any}
      outerRef={outerRef}
      height={height}
      width={width}
      itemCount={itemData.treeState.length()}
      itemData={itemData as any}
      itemKey={(index, itemData) => itemData.treeState.idByIndex(index)}
      itemSize={(index) =>
        handler.current?.getHeight(treeState.idByIndex(index))
      }
      overscanCount={20}
    >
      {TreeItem}
    </VariableSizeList>
  );
}
