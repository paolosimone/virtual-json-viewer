import React, { JSX } from "react";
import { VariableSizeList } from "react-window";
// import { TreeNavigator } from "./TreeNavigator";
import { TreeState } from "./TreeState";
import { TreeNode } from "./TreeNode";

export type TreeProps = Props<{
  height: number;
  width: number;
  treeState: TreeState;
}>;

export function Tree({ height, width, treeState }: TreeProps): JSX.Element {
  // fix tab navigation on firefox
  // Ref: https://github.com/bvaughn/react-window/issues/130
  // const [treeDiv, treeDivRef] = useReactiveRef<HTMLDivElement>();
  // if (treeDiv) treeDiv.tabIndex = -1;

  return (
    <VariableSizeList
      height={height}
      width={width}
      itemCount={treeState.length()}
      itemData={treeState}
      itemKey={(index, treeState) => treeState.idByIndex(index)}
      itemSize={() => 30}
      overscanCount={20}
    >
      {TreeNode}
    </VariableSizeList>
  );
}
