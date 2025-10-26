import { JSX } from "react";
import { type RowComponentProps } from "react-window";
import { TreeNodeComponent } from "./TreeNodeComponent";
import { TreeState } from "./TreeState";

export type TreeRowProps<Context> = {
  treeState: TreeState;
  context: Context;
  TreeNode: TreeNodeComponent<Context>;
};

export function TreeRow<Context>({
  index,
  style,
  treeState,
  context,
  TreeNode,
}: RowComponentProps<TreeRowProps<Context>>): JSX.Element {
  const nodeState = treeState.nodeByIndex(index);
  return <TreeNode style={style} node={nodeState} context={context} />;
}
