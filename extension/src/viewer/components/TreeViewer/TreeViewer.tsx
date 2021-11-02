import React, { useCallback, useMemo, useRef } from "react";
import { AutoSizer } from "react-virtualized";
import {
  VariableSizeNodePublicState as NodeState,
  VariableSizeTree as Tree,
} from "react-vtree";
import { EventType } from "viewer/commons/EventBus";
import { useEventBusListener, useWindowSize } from "viewer/hooks";
import { Search } from "viewer/state";
import { JsonNodeData } from "./model/JsonNode";
import { getRootNodes, isLeaf, jsonTreeWalker } from "./model/JsonTreeWalker";
import { TreeNode } from "./TreeNode";

const RESIZE_DELAY = 100;

export type TreeViewerProps = {
  json: Json;
  search: Search;
};

export function TreeViewer({ json, search }: TreeViewerProps): JSX.Element {
  // force update on window resize
  useWindowSize(RESIZE_DELAY);

  const tree = useRef<Tree<JsonNodeData>>(null);

  const expand = useCallback(() => setOpen(json, tree, true), [json, tree]);
  useEventBusListener(EventType.Expand, expand);

  const collapse = useCallback(() => setOpen(json, tree, false), [json, tree]);
  useEventBusListener(EventType.Collapse, collapse);

  const treeWalker = useMemo(
    () => jsonTreeWalker(json, search),
    [json, search]
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <Tree ref={tree} treeWalker={treeWalker} height={height} width={width}>
          {TreeNode}
        </Tree>
      )}
    </AutoSizer>
  );
}

function setOpen(
  json: Json,
  tree: React.RefObject<Tree<JsonNodeData>>,
  isOpen: boolean
) {
  function subtreeCallback(
    node: NodeState<JsonNodeData>,
    ownerNode: NodeState<JsonNodeData>
  ) {
    if (node !== ownerNode) {
      node.isOpen = !node.data.isLeaf && isOpen;
    }
  }

  const newState = Object.fromEntries(
    getRootNodes(json).map(({ key, value }) => [
      key,
      { open: !isLeaf(value) && isOpen, subtreeCallback },
    ])
  );

  tree.current?.recomputeTree(newState);
}
