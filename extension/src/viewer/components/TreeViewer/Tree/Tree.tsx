import {
  JSX,
  Ref,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import { TreeNode } from "../TreeNode";
import { TreeState } from "./TreeState";
import { TreeWalker } from "./TreeWalker";

export type TreeProps = Props<{
  height: number;
  width: number;
  treeWalker: TreeWalker;
  ref?: Ref<TreeState>;
}>;

export function Tree({
  height,
  width,
  treeWalker,
  ref,
}: TreeProps): JSX.Element {
  // fix tab navigation on firefox
  // Ref: https://github.com/bvaughn/react-window/issues/130
  // const [treeDiv, treeDivRef] = useReactiveRef<HTMLDivElement>();
  // if (treeDiv) treeDiv.tabIndex = -1;

  // Bind the tree state to the treeWalker
  const [treeState, setTreeState] = useState<TreeState>(() => new TreeState());
  treeState.observeStateChange(setTreeState);
  useEffect(() => treeState.load(treeWalker), [treeWalker]);

  // Expose the tree state to the parent component
  useImperativeHandle(ref, () => treeState, [treeState]);

  // TODO navigation
  const itemData = useMemo(() => ({ treeState }), [treeState]);

  return (
    <VariableSizeList
      height={height}
      width={width}
      itemCount={itemData.treeState.length()}
      itemData={itemData}
      itemKey={(index, itemData) => itemData.treeState.idByIndex(index)}
      itemSize={() => 30}
      overscanCount={20}
    >
      {VariableSizeListItem}
    </VariableSizeList>
  );
}

type ItemData = {
  treeState: TreeState;
};

type VariableSizeListItemProps = ListChildComponentProps<ItemData>;

function VariableSizeListItem({
  index,
  data: { treeState },
  style,
}: VariableSizeListItemProps): JSX.Element {
  const nodeState = treeState.nodeByIndex(index);
  return <TreeNode tree={treeState} node={nodeState} style={style} />;
}
