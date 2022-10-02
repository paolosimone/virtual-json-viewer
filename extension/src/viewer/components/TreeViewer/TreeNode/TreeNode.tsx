import classNames from "classnames";
import { useEffect, useLayoutEffect } from "react";
import { VariableSizeNodePublicState as NodeState } from "react-vtree";
import { NodeComponentProps } from "react-vtree/dist/es/Tree";
import { RefCurrent, useReactiveRef } from "viewer/hooks";
import { Search } from "viewer/state";
import { JsonNodeData } from "../model/JsonNode";
import { TreeNavigator } from "../TreeNavigator";
import { Key } from "./Key";
import { OpenButton } from "./OpenButton";
import { Value } from "./Value";

export type JsonTreeNode = NodeComponentProps<
  JsonNodeData,
  NodeState<JsonNodeData>
>;

export function TreeNode({
  data,
  style,
  resize,
  treeData,
}: JsonTreeNode): JSX.Element {
  const [parent, parentRef] = useReactiveRef<HTMLDivElement>();
  const [content, contentRef] = useReactiveRef<HTMLDivElement>();

  useFitContent(parent, content, resize);

  const treeNavigator: TreeNavigator = treeData.navigator;

  useLayoutEffect(() => {
    if (!parent) return;
    treeNavigator.onElemShown(data.id, parent);
    return () => treeNavigator.onElemHidden(data.id);
  }, [data.id, parent, treeNavigator]);

  const searchAnalysis = analyzeSearchMatch(data);
  const fade = { "opacity-60": !searchAnalysis.inMatchingPath };

  return (
    <div
      ref={parentRef}
      className="focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600"
      style={{ ...style, paddingLeft: `${data.nesting}em` }}
      tabIndex={-1}
      onClick={() => parent?.focus()}
      onKeyDown={(e) => handleNavigation(data.id, treeNavigator, e)}
    >
      <div ref={contentRef} className={classNames("flex items-start", fade)}>
        <OpenButton data={data} treeNavigator={treeNavigator} />
        <Key data={data} search={searchAnalysis.keySearch} />
        <Value
          data={data}
          treeNavigator={treeNavigator}
          search={searchAnalysis.valueSearch}
        />
      </div>
    </div>
  );
}

type Resize = (height: number, shouldForceUpdate?: boolean) => void;

function useFitContent(
  parent: RefCurrent<HTMLElement>,
  content: RefCurrent<HTMLElement>,
  resize: Resize
) {
  const PADDING_HEIGHT = 4;
  const TOLERANCE = 2;

  const fitContent = () => {
    if (!parent || !content) return;
    const parentHeight = parent.clientHeight;
    const contentHeight = content.clientHeight + PADDING_HEIGHT;
    const delta = Math.abs(contentHeight - parentHeight);
    if (delta > TOLERANCE) {
      resize(contentHeight, true);
    }
  };

  // fit content on *every* component update
  useEffect(fitContent);
}

type SearchMatchAnalysis = {
  inMatchingPath: boolean;
  keySearch: Nullable<Search>;
  valueSearch: Nullable<Search>;
};

function analyzeSearchMatch({
  searchMatch,
  isLeaf,
}: JsonNodeData): SearchMatchAnalysis {
  if (!searchMatch) {
    return { inMatchingPath: true, keySearch: null, valueSearch: null };
  }

  return {
    inMatchingPath: searchMatch.inKey || searchMatch.inValue,
    keySearch: searchMatch.inKey ? searchMatch.search : null,
    valueSearch: isLeaf && searchMatch.inValue ? searchMatch.search : null,
  };
}

function handleNavigation(
  id: string,
  treeNavigator: TreeNavigator,
  e: React.KeyboardEvent
) {
  if (e.shiftKey || e.ctrlKey || e.metaKey) {
    return;
  }

  switch (e.key) {
    case "ArrowDown":
    case "j":
      e.preventDefault();
      treeNavigator.gotoNext(id);
      return;

    case "ArrowUp":
    case "k":
      e.preventDefault();
      treeNavigator.gotoPrevious(id);
      return;

    case "ArrowRight":
    case "l":
      e.preventDefault();
      treeNavigator.open(id);
      return;

    case "ArrowLeft":
    case "h":
      e.preventDefault();
      treeNavigator.close(id);
      return;

    case " ":
      e.preventDefault();
      treeNavigator.toogleOpen(id);
      return;
  }
}
