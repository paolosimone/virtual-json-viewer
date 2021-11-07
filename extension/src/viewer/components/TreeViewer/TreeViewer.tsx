import React, { RefObject, useCallback, useMemo, useRef } from "react";
import {
  VariableSizeNodePublicState as NodeState,
  VariableSizeTree as Tree,
} from "react-vtree";
import { EventType } from "viewer/commons/EventBus";
import * as Json from "viewer/commons/Json";
import { useElementSize, useEventBusListener } from "viewer/hooks";
import { Search } from "viewer/state";
import { JsonNodeData } from "./model/JsonNode";
import { getRootNodes, isLeaf, jsonTreeWalker } from "./model/JsonTreeWalker";
import { TreeNode } from "./TreeNode";

const RESIZE_DELAY = 100;

export type TreeViewerProps = {
  parent: RefObject<HTMLDivElement>;
  json: Json.Root;
  search: Search;
};

export function TreeViewer({
  parent,
  json,
  search,
}: TreeViewerProps): JSX.Element {
  const tree = useRef<Tree<JsonNodeData>>(null);

  const expand = useCallback(() => setOpen(json, tree, true), [json, tree]);
  useEventBusListener(EventType.Expand, expand);

  const collapse = useCallback(() => setOpen(json, tree, false), [json, tree]);
  useEventBusListener(EventType.Collapse, collapse);

  const treeWalker = useMemo(
    () => jsonTreeWalker(json, search),
    [json, search]
  );

  // for some obscure reason AutoSizer doesn't work on Firefox when loaded as extension
  const { height, width } = useElementSize(parent, RESIZE_DELAY);

  return (
    <Tree ref={tree} treeWalker={treeWalker} height={height} width={width}>
      {TreeNode}
    </Tree>
  );
}

function setOpen(
  json: Json.Root,
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
