import classNames from "classnames";
import { useCallback, useEffect, useRef } from "react";
import { VariableSizeNodePublicState as NodeState } from "react-vtree";
import { NodeComponentProps } from "react-vtree/dist/es/Tree";
import { useKeydownEvent } from "viewer/hooks";
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
  const [parent, content] = useFitContent(resize);

  const treeNavigator: TreeNavigator = treeData.navigator;

  const navigate = useCallback(
    (e: KeyboardEvent) => handleNavigation(data.id, treeNavigator, e),
    [data.id, treeNavigator]
  );
  useKeydownEvent(navigate, parent);

  useEffect(() => {
    if (!parent.current) return;
    treeNavigator.onElemShown(data.id, parent.current);
    return () => treeNavigator.onElemHidden(data.id);
  }, [data.id, parent.current, treeNavigator]);

  const searchAnalysis = analyzeSearchMatch(data);
  const fade = { "opacity-60": !searchAnalysis.inMatchingPath };

  return (
    <div
      ref={parent}
      className="focus:ring"
      style={{ ...style, paddingLeft: `${data.nesting}em` }}
      tabIndex={-1}
      onClick={() => parent.current?.focus()}
    >
      <div ref={content} className={classNames("flex items-start", fade)}>
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
type Ref = React.RefObject<HTMLDivElement>;
type ParentContentRefs = [Ref, Ref];

function useFitContent(resize: Resize): ParentContentRefs {
  const PADDING_HEIGHT = 4;
  const TOLERANCE = 2;

  const parent = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  const fitContent = () => {
    const parentHeight = parent.current?.clientHeight ?? 0;
    const contentHeight = (content.current?.clientHeight ?? 0) + PADDING_HEIGHT;
    const delta = Math.abs(contentHeight - parentHeight);
    if (delta > TOLERANCE) {
      resize(contentHeight, true);
    }
  };

  // fit content on every component update
  useEffect(fitContent);

  return [parent, content];
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
  e: KeyboardEvent
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
      treeNavigator.setOpen(id, true);
      return;

    case "ArrowLeft":
    case "h":
      e.preventDefault();
      treeNavigator.setOpen(id, false);
      return;

    case " ":
      e.preventDefault();
      treeNavigator.toogleOpen(id);
      return;
  }
}
