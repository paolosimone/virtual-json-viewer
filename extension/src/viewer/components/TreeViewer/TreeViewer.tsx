import * as DOM from "@/viewer/commons/Dom";
import { EventType } from "@/viewer/commons/EventBus";
import * as Json from "@/viewer/commons/Json";
import {
  CHORD_KEY,
  KeydownBufferEvent,
  KeydownEvent,
  isUpperCaseKeypress,
  useElementSize,
  useEventBusListener,
  useGlobalKeydownEvent,
  useKeydownBuffer,
  useReactiveRef,
} from "@/viewer/hooks";
import { Search, SettingsContext } from "@/viewer/state";
import classNames from "classnames";
import {
  JSX,
  RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import {
  VariableSizeNodePublicState as NodeState,
  VariableSizeTree as Tree,
} from "react-vtree";
import { TreeNavigator } from "./TreeNavigator";
import { TreeNode } from "./TreeNode";
import { JsonNodeData } from "./model/JsonNode";
import { buildId, getRootNodes, jsonTreeWalker } from "./model/JsonTreeWalker";

export type TreeViewerProps = Props<{
  jsonLines: Json.Lines;
  search: Search;
  isLargeJson: boolean;
}>;

export function TreeViewer({
  jsonLines,
  search,
  className,
}: TreeViewerProps): JSX.Element {
  // single line -> shown on its own
  // multiple lines -> shown as an array
  const json = useMemo(
    () => (jsonLines.length == 1 ? jsonLines[0] : jsonLines),
    [jsonLines],
  );

  const { expandNodes } = useContext(SettingsContext);
  const tree = useRef<Nullable<Tree<JsonNodeData>>>(null);

  // for some obscure reason AutoSizer doesn't work on Firefox when loaded as extension
  const [parent, parentRef] = useReactiveRef<HTMLDivElement>();
  const { height, width } = useElementSize(parent);

  // tree walker for building the tree
  const treeWalker = useMemo(
    () => jsonTreeWalker(json, search, expandNodes),
    [json, search, expandNodes],
  );

  // global events
  const expand = useCallback(() => setOpen(json, tree, true), [json, tree]);
  useEventBusListener(EventType.Expand, expand);

  const collapse = useCallback(() => setOpen(json, tree, false), [json, tree]);
  useEventBusListener(EventType.Collapse, collapse);

  // register global shortcut
  const handleShortcut = useCallback(
    (e: KeydownEvent) => {
      if (e[CHORD_KEY] && e.key === "0") {
        e.preventDefault();
        parent?.focus();
      }
    },
    [parent],
  );
  useGlobalKeydownEvent(handleShortcut);

  // keyboard navigation
  const treeNavigator = useMemo(
    () => new TreeNavigator(tree, parent),
    [tree, parent],
  );

  const navigate = useCallback(
    (e: KeydownBufferEvent) => handleNavigation(parent, treeNavigator, e),
    [parent, treeNavigator],
  );
  const onKeydown = useKeydownBuffer(navigate, {
    bufferSize: 2,
    keypressDelay: 500,
  });

  // fix tab navigation on firefox
  // Ref: https://github.com/bvaughn/react-window/issues/130
  const [treeDiv, treeDivRef] = useReactiveRef<HTMLDivElement>();
  if (treeDiv) treeDiv.tabIndex = -1;

  return (
    <div
      ref={parentRef}
      className={classNames(className, "relative")}
      tabIndex={0}
      onKeyDown={onKeydown}
    >
      {/* @ts-expect-error react-vtree signature not compatible with React 19 */}
      <Tree
        ref={tree}
        treeWalker={treeWalker}
        outerRef={treeDivRef}
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
  tree: RefObject<Nullable<Tree<JsonNodeData>>>,
  isOpen: boolean,
) {
  function subtreeCallback(
    node: NodeState<JsonNodeData>,
    ownerNode: NodeState<JsonNodeData>,
  ) {
    if (node !== ownerNode) {
      node.isOpen = !node.data.isLeaf && isOpen;
    }
  }

  const newState = Object.fromEntries(
    getRootNodes(json).map(({ key, value }) => [
      buildId(key, null),
      { open: !Json.isLeaf(value) && isOpen, subtreeCallback },
    ]),
  );

  tree.current?.recomputeTree(newState);
}

function handleNavigation(
  treeElem: Nullable<HTMLElement>,
  treeNavigator: TreeNavigator,
  { last: e, text }: KeydownBufferEvent,
) {
  const id = treeNavigator.getCurrentId();

  // Focus

  if (e.key == "Enter") {
    e.preventDefault();
    if (id) treeNavigator.goto(id);
    return;
  }

  if (e.key == "Escape") {
    e.preventDefault();
    treeElem?.focus();
    DOM.deselectAllText();
    return;
  }

  // Row navigation

  if (e.key == "ArrowDown" || e.key == "j") {
    e.preventDefault();
    if (id) treeNavigator.gotoOffset(id, { rows: 1 });
    return;
  }

  if (e.key == "ArrowUp" || e.key == "k") {
    e.preventDefault();
    if (id) treeNavigator.gotoOffset(id, { rows: -1 });
    return;
  }

  // Page navigation

  if (e.key == "PageDown" || isUpperCaseKeypress(e, "J")) {
    e.preventDefault();
    if (id) treeNavigator.gotoOffset(id, { pages: 1 });
    return;
  }

  if (e.key == "PageUp" || isUpperCaseKeypress(e, "K")) {
    e.preventDefault();
    if (id) treeNavigator.gotoOffset(id, { pages: -1 });
    return;
  }

  if (e.key == "Home" || text.slice(-2) == "gg") {
    e.preventDefault();
    treeNavigator.gotoFirst();
    return;
  }

  if (e.key == "End" || isUpperCaseKeypress(e, "G")) {
    e.preventDefault();
    treeNavigator.gotoLast();
    return;
  }

  // Open state

  if (e.key == "ArrowRight" || e.key == "l") {
    e.preventDefault();
    if (id) treeNavigator.open(id);
    return;
  }

  if (e.key == "ArrowLeft" || e.key == "h") {
    e.preventDefault();
    if (id) treeNavigator.close(id);
    return;
  }

  if (e.key == " ") {
    e.preventDefault();
    if (id) treeNavigator.toogleOpen(id);
    return;
  }
}
