import { JSX } from "react";
import { ListChildComponentProps } from "react-window";
import { TreeNodeComponent } from "./TreeNodeComponent";
import { TreeState } from "./TreeState";

export type ItemData<Context> = {
  treeState: TreeState;
  context: Context;
  TreeNode: TreeNodeComponent<Context>;
};

export type VariableSizeListItemProps<Context> = ListChildComponentProps<
  ItemData<Context>
>;

export function TreeItem<Context>({
  index,
  data: { treeState, TreeNode, context },
  style,
}: VariableSizeListItemProps<Context>): JSX.Element {
  const nodeState = treeState.nodeByIndex(index);
  return <TreeNode style={style} node={nodeState} context={context} />;
}
