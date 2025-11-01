import { SettingsContext, TextSize } from "@/viewer/state";
import {
  JSX,
  Ref,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { List, useDynamicRowHeight, useListCallbackRef } from "react-window";
import { TreeWalker } from "../TreeWalker";
import { TreeHandler } from "./TreeHandler";
import { TreeNodeComponent } from "./TreeNodeComponent";
import { TreeRow, TreeRowProps } from "./TreeRow";
import { TreeState } from "./TreeState";

export type TreeProps<Context> = {
  height: number;
  width: number;
  treeWalker: TreeWalker;
  context: Context;
  children: TreeNodeComponent<Context>;
  ref?: Ref<TreeHandler>;
};

export function Tree<Context>({
  height,
  width,
  treeWalker,
  context,
  children: TreeNode,
  ref,
}: TreeProps<Context>): JSX.Element {
  // TreeState is a reference to the mutable state of the tree.
  // The reference gets updated whenever the state changes to trigger reactive updates.
  // The underlying data structure is mutable, so any reference points to the latest state.
  const [treeState, setTreeState] = useState<TreeState>(() => new TreeState());
  useEffect(() => treeState.observeStateChange(setTreeState), []);
  useEffect(() => treeState.load(treeWalker), [treeWalker]);

  // Reference to the list component
  const [list, listRef] = useListCallbackRef(null);

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

  const rowProps: TreeRowProps<Context> = useMemo(
    () => ({ treeState, context, TreeNode }),
    [treeState, context, TreeNode],
  );

  const defaultRowHeight = useDefaultRowHeight();
  const rowHeight = useDynamicRowHeight({ defaultRowHeight });

  return (
    <List<TreeRowProps<Context>>
      tabIndex={-1}
      listRef={listRef}
      style={{ height, width }}
      rowComponent={TreeRow}
      rowCount={rowProps.treeState.length()}
      rowHeight={rowHeight}
      rowProps={rowProps}
      overscanCount={50} // ~page size with default settings
    />
  );
}

// Heuristic to reduce layout shifts assuming 1rem = 16px
const DEFAULT_ROW_HEIGHTS: Record<TextSize, number> = {
  [TextSize.ExtraSmall]: 16,
  [TextSize.Small]: 20,
  [TextSize.Medium]: 24,
  [TextSize.Large]: 28,
  [TextSize.ExtraLarge]: 28,
};

function useDefaultRowHeight(): number {
  const { textSize } = useContext(SettingsContext);
  return DEFAULT_ROW_HEIGHTS[textSize];
}
