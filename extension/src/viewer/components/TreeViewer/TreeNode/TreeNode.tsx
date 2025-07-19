import * as DOM from "@/viewer/commons/Dom";
import { CHORD_KEY, RefCurrent, useReactiveRef } from "@/viewer/hooks";
import { Search } from "@/viewer/state";
import classNames from "classnames";
import { JSX, useCallback, useEffect } from "react";
import { NodeState, TreeNodeProps } from "../Tree";
import { TreeNavigator } from "../TreeNavigator";
import { Key, KeyHandle } from "./Key";
import { OpenButton } from "./OpenButton";
import { Value, ValueHandle } from "./Value";

export function TreeNode({
  context: tree,
  node,
  style,
}: TreeNodeProps<TreeNavigator>): JSX.Element {
  const [parent, parentRef] = useReactiveRef<HTMLDivElement>();
  const [content, contentRef] = useReactiveRef<HTMLDivElement>();
  // const [key, keyRef] = useReactiveRef<KeyHandle>();
  // const [value, valueRef] = useReactiveRef<ValueHandle>();

  const resize = (height: number) => tree.resize(node.id, height);
  useFitContent(parent, content, resize);

  // useLayoutEffect(() => {
  //   if (!parent) return;
  //   treeNavigator.onElemShown(data.id, parent);
  //   return () => treeNavigator.onElemHidden(data.id);
  // }, [data.id, parent, treeNavigator]);

  // const onKeydown = (e: React.KeyboardEvent) => {
  //   handleShortcuts({ content, key, value }, e);
  // };

  const searchAnalysis = analyzeSearchMatch(node);
  const fade = { "opacity-60": !searchAnalysis.inMatchingPath };

  return (
    <div
      ref={parentRef}
      className="focus:bg-viewer-focus focus:outline-hidden"
      style={{ ...style, paddingLeft: `${node.nesting}em` }}
      tabIndex={-1}
      onClick={() => tree.toggleOpen(node.id)}
      // onClick={() => parent?.focus()}
      // onKeyDown={onKeydown}
    >
      <div ref={contentRef} className={classNames("flex items-start", fade)}>
        <OpenButton
          className="shrink-0"
          node={node}
          // treeNavigator={treeNavigator}
        />
        <Key
          // ref={keyRef}
          node={node}
          search={searchAnalysis.keySearch}
        />
        <Value
          // ref={valueRef}
          className="grow"
          node={node}
          // treeNavigator={treeNavigator}
          search={searchAnalysis.valueSearch}
        />
      </div>
    </div>
  );
}

type Resize = (height: number) => void;

function useFitContent(
  parent: RefCurrent<HTMLElement>,
  content: RefCurrent<HTMLElement>,
  resize: Resize,
) {
  const PADDING_HEIGHT = 4;
  const TOLERANCE = 2;

  const fitContent = () => {
    if (!parent || !content) return;
    const parentHeight = parent.clientHeight;
    const contentHeight = content.clientHeight + PADDING_HEIGHT;
    const delta = Math.abs(contentHeight - parentHeight);
    if (delta > TOLERANCE) {
      resize(contentHeight);
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
}: NodeState): SearchMatchAnalysis {
  if (!searchMatch) {
    return { inMatchingPath: true, keySearch: null, valueSearch: null };
  }

  return {
    inMatchingPath: searchMatch.inKey || searchMatch.inValue,
    keySearch: searchMatch.inKey ? searchMatch.search : null,
    valueSearch: isLeaf && searchMatch.inValue ? searchMatch.search : null,
  };
}

type NodeRefs = {
  content: RefCurrent<HTMLDivElement>;
  key: RefCurrent<KeyHandle>;
  value: RefCurrent<ValueHandle>;
};

function handleShortcuts(
  { content, key, value }: NodeRefs,
  e: React.KeyboardEvent,
) {
  if (e[CHORD_KEY] && e.key === "a") {
    e.preventDefault();
    if (content) DOM.selectAllText(content);
    return;
  }

  if ((e.shiftKey && e.key == "ArrowLeft") || e.key == "H") {
    e.preventDefault();
    key?.selectText();
    return;
  }

  if ((e.shiftKey && e.key == "ArrowRight") || e.key == "L") {
    e.preventDefault();
    value?.selectText();
    return;
  }
}
