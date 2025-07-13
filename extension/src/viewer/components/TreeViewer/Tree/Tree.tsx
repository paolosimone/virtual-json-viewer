import {
  JSX,
  Ref,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import { TreeWalker } from "../TreeWalker";
import { NodeState } from "./NodeState";
import { TreeState } from "./TreeState";

export type TreeNodeProps<Context> = {
  style?: React.CSSProperties;
  node: NodeState;
  context: Context;
};

export type TreeNodeComponent<Context> = React.ComponentType<
  TreeNodeProps<Context>
>;

export type TreeProps<Context> = {
  height: number;
  width: number;
  treeWalker: TreeWalker;
  context: Context;
  children: TreeNodeComponent<Context>;
  ref?: Ref<TreeState>;
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
  treeState.observeStateChange(setTreeState);
  useEffect(() => treeState.load(treeWalker), [treeWalker]);

  // Expose an handler to manipulate the tree state
  useImperativeHandle(ref, () => treeState, [treeState]);

  const itemData: ItemData<Context> = useMemo(
    () => ({ treeState, context, TreeNode }),
    [treeState, context, TreeNode],
  );

  return (
    <VariableSizeList
      outerRef={outerRef}
      height={height}
      width={width}
      itemCount={itemData.treeState.length()}
      // react-window is not able to infer the type from generics
      itemData={itemData as any}
      itemKey={(index, itemData) => itemData.treeState.idByIndex(index)}
      itemSize={() => 30}
      overscanCount={20}
    >
      {VariableSizeListItem}
    </VariableSizeList>
  );
}

type ItemData<Context> = {
  treeState: TreeState;
  context: Context;
  TreeNode: TreeNodeComponent<Context>;
};

type VariableSizeListItemProps<Context> = ListChildComponentProps<
  ItemData<Context>
>;

function VariableSizeListItem<Context>({
  index,
  data: { treeState, TreeNode, context },
  style,
}: VariableSizeListItemProps<Context>): JSX.Element {
  const nodeState = treeState.nodeByIndex(index);
  return <TreeNode style={style} node={nodeState} context={context} />;
}
