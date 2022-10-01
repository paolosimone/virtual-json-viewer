import { RefObject, useCallback, useMemo, useRef } from "react";
import {
  VariableSizeNodePublicState as NodeState,
  VariableSizeTree as Tree,
} from "react-vtree";
import { EventType } from "viewer/commons/EventBus";
import * as Json from "viewer/commons/Json";
import {
  useElementSize,
  useEventBusListener,
  useKeydownEvent,
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
  const parent = useRef<HTMLDivElement>(null);
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

  // keyboard navigation and shortcuts
  const treeNavigator = useMemo(() => new TreeNavigator(tree), [tree]);
  const startNavigation = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        treeNavigator.gotoLastFocused();
      }
    },
    [treeNavigator]
  );
  useKeydownEvent(startNavigation, parent);

  return (
    <div ref={parent} className={className} tabIndex={0}>
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
