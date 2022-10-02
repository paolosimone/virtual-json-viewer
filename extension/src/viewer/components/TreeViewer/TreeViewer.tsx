import React, { RefObject, useCallback, useMemo, useRef } from "react";
import {
  VariableSizeNodePublicState as NodeState,
  VariableSizeTree as Tree,
} from "react-vtree";
import { EventType } from "viewer/commons/EventBus";
import * as Json from "viewer/commons/Json";
import {
  CHORD_KEY,
  useElementSize,
  useEventBusListener,
  useGlobalKeydownEvent,
  useReactiveRef,
} from "viewer/hooks";
import { Search } from "viewer/state";
import { JsonNodeData } from "./model/JsonNode";
import {
  buildId,
  getRootNodes,
  isLeaf,
  jsonTreeWalker,
} from "./model/JsonTreeWalker";
import { TreeNavigator } from "./TreeNavigator";
import { TreeNode } from "./TreeNode";

const RESIZE_DELAY = 100;

export type TreeViewerProps = Props<{
  json: Json.Root;
  search: Search;
}>;

export function TreeViewer({
  json,
  search,
  className,
}: TreeViewerProps): JSX.Element {
  const tree = useRef<Tree<JsonNodeData>>(null);

  // for some obscure reason AutoSizer doesn't work on Firefox when loaded as extension
  const [parent, parentRef] = useReactiveRef<HTMLDivElement>();
  const { height, width } = useElementSize(parent, RESIZE_DELAY);

  // tree walker for building the tree
  const treeWalker = useMemo(
    () => jsonTreeWalker(json, search),
    [json, search]
  );

  // global events
  const expand = useCallback(() => setOpen(json, tree, true), [json, tree]);
  useEventBusListener(EventType.Expand, expand);

  const collapse = useCallback(() => setOpen(json, tree, false), [json, tree]);
  useEventBusListener(EventType.Collapse, collapse);

  // register global shortcut
  const handleShortcut = useCallback(
    (e: KeyboardEvent) => {
      if (e[CHORD_KEY] && e.key === "0") {
        e.preventDefault();
        parent?.focus();
      }
    },
    [parent]
  );
  useGlobalKeydownEvent(handleShortcut);

  // keyboard navigation
  const treeNavigator = useMemo(
    () => new TreeNavigator(tree, parent),
    [tree, parent]
  );

  return (
    <div
      ref={parentRef}
      className={className}
      tabIndex={0}
      onKeyDown={(e) => handleNavigation(parent, treeNavigator, e)}
    >
      <Tree
        ref={tree}
        treeWalker={treeWalker}
        height={height}
        width={width}
        itemData={{ navigator: treeNavigator }}
      >
        {TreeNode}
      </Tree>
    </div>
  );
}

function setOpen(
  json: Json.Root,
  tree: RefObject<Tree<JsonNodeData>>,
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
      buildId(key, null),
      { open: !isLeaf(value) && isOpen, subtreeCallback },
    ])
  );

  tree.current?.recomputeTree(newState);
}

function handleNavigation(
  treeElem: Nullable<HTMLElement>,
  treeNavigator: TreeNavigator,
  e: React.KeyboardEvent
) {
  switch (e.key) {
    case "Enter":
      e.preventDefault();
      treeNavigator.gotoLastFocused();
      return;

    case "Escape":
      e.preventDefault();
      treeElem?.focus();
      return;

    case "Home":
      e.preventDefault();
      treeNavigator.gotoFirst();
      return;

    case "End":
      e.preventDefault();
      treeNavigator.gotoLast();
      return;
  }
}
