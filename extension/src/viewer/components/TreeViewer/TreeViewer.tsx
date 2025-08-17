import * as DOM from "@/viewer/commons/Dom";
import { EventType } from "@/viewer/commons/EventBus";
import * as Json from "@/viewer/commons/Json";
import {
  CHORD_KEY,
  isUpperCaseKeypress,
  KeydownBufferEvent,
  KeydownEvent,
  StateObject,
  useElementSize,
  useEventBusListener,
  useGlobalKeydownEvent,
  useKeydownBuffer,
  useReactiveRef,
} from "@/viewer/hooks";
import { Search, SearchNavigation, SettingsContext } from "@/viewer/state";
import classNames from "classnames";
import { JSX, useCallback, useContext, useEffect, useMemo } from "react";
import { NodeId, Tree, TreeHandler } from "./Tree";
import { TreeNavigator } from "./TreeNavigator";
import { TreeNode } from "./TreeNode";
import { treeWalker } from "./TreeWalker";

export type TreeViewerProps = Props<{
  jsonLines: Json.Lines;
  search: Search;
  searchNavigationState: StateObject<SearchNavigation>;
  isLargeJson: boolean;
}>;

export function TreeViewer({
  jsonLines,
  search,
  searchNavigationState,
  className,
}: TreeViewerProps): JSX.Element {
  // Single line -> shown on its own
  // Multiple lines -> shown as an array
  const json = useMemo(
    () => (jsonLines.length == 1 ? jsonLines[0] : jsonLines),
    [jsonLines],
  );

  const { expandNodes } = useContext(SettingsContext);

  // Tree walker for building the tree
  const walker = useMemo(
    () => treeWalker(json, search, expandNodes),
    [json, search, expandNodes],
  );

  // Imperative reference to manipulate the tree.
  // It changes when the content is (re)loaded.
  const [tree, treeRef] = useReactiveRef<TreeHandler>();

  // For some obscure reason AutoSizer doesn't work on Firefox when loaded as extension
  const [parent, parentRef] = useReactiveRef<HTMLDivElement>();
  const { height, width } = useElementSize(parent);

  // Global events
  const expand = useCallback(() => tree?.openAll(), [tree]);
  useEventBusListener(EventType.Expand, expand);

  const collapse = useCallback(() => tree?.closeAll(), [tree]);
  useEventBusListener(EventType.Collapse, collapse);

  // Register global shortcut
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

  // Tree Navigator
  const treeNavigator = useMemo(
    () => new TreeNavigator(tree, parent),
    [tree, parent],
  );

  // Keyboard navigation
  const navigate = useCallback(
    (e: KeydownBufferEvent) => handleNavigation(parent, treeNavigator, e),
    [parent, treeNavigator],
  );
  const onKeydown = useKeydownBuffer(navigate, {
    bufferSize: 2,
    keypressDelay: 500,
  });

  // Search navigation
  useEffect(() => {
    // Micro-optimization: avoid O(N) scan if search is not active
    // No need to add search dependency, because the navigator is rebuilt when search changes
    if (!search.text) return;
    treeNavigator.enableSearchNavigation(searchNavigationState.setValue);
  }, [treeNavigator]);

  const goToPreviousMatch = useCallback(
    () => treeNavigator.goToPreviousSearchMatch(),
    [treeNavigator],
  );
  useEventBusListener(EventType.SearchNavigatePrevious, goToPreviousMatch);

  const goToNextMatch = useCallback(
    () => treeNavigator.goToNextSearchMatch(),
    [treeNavigator],
  );
  useEventBusListener(EventType.SearchNavigateNext, goToNextMatch);

  // Fix tab navigation on firefox
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
      <Tree
        height={height}
        width={width}
        treeWalker={walker}
        ref={treeRef}
        outerRef={treeDivRef}
        context={treeNavigator}
      >
        {TreeNode}
      </Tree>
    </div>
  );
}

function handleNavigation(
  treeElem: Nullable<HTMLElement>,
  tree: TreeNavigator,
  { last: e, text }: KeydownBufferEvent,
) {
  function from(navigate: (id: NodeId) => void) {
    const id = tree.getCurrentId();
    if (id !== undefined) navigate(id);
  }

  // Focus

  if (e.key == "Enter") {
    e.preventDefault();
    from((id) => tree.goto(id));
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
    from((id) => tree.gotoOffset(id, { rows: 1 }));
    return;
  }

  if (e.key == "ArrowUp" || e.key == "k") {
    e.preventDefault();
    from((id) => tree.gotoOffset(id, { rows: -1 }));
    return;
  }

  // Page navigation

  if (e.key == "PageDown" || isUpperCaseKeypress(e, "J")) {
    e.preventDefault();
    from((id) => tree.gotoOffset(id, { pages: 1 }));
    return;
  }

  if (e.key == "PageUp" || isUpperCaseKeypress(e, "K")) {
    e.preventDefault();
    from((id) => tree.gotoOffset(id, { pages: -1 }));
    return;
  }

  if (e.key == "Home" || text.slice(-2) == "gg") {
    e.preventDefault();
    tree.gotoFirst();
    return;
  }

  if (e.key == "End" || isUpperCaseKeypress(e, "G")) {
    e.preventDefault();
    tree.gotoLast();
    return;
  }

  // Open state

  if (e.key == "ArrowRight" || e.key == "l") {
    e.preventDefault();
    from((id) => tree.open(id));
    return;
  }

  if (e.key == "ArrowLeft" || e.key == "h") {
    e.preventDefault();
    from((id) => tree.close(id));
    return;
  }

  if (e.key == " ") {
    e.preventDefault();
    from((id) => tree.toggleOpen(id));
    return;
  }
}
