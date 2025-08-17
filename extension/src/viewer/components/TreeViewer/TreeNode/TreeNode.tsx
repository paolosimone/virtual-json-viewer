import * as DOM from "@/viewer/commons/Dom";
import {
  CHORD_KEY,
  isUpperCaseKeypress,
  RefCurrent,
  useReactiveRef,
} from "@/viewer/hooks";
import classNames from "classnames";
import { JSX, useEffect, useLayoutEffect } from "react";
import { NodeSearchMatch, TreeNodeProps } from "../Tree";
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
  const [key, keyRef] = useReactiveRef<KeyHandle>();
  const [value, valueRef] = useReactiveRef<ValueHandle>();

  // Resize the node to fit its content on every re-render
  const resize = (height: number) => tree.resize(node.id, height);
  useFitContent(parent, content, resize);

  // Registers the node's html element in the navigator
  // TODO handler
  useLayoutEffect(() => {
    if (!parent) return;
    tree.onElemShown(node.id, parent);
    return () => tree.onElemHidden(node.id);
  }, [node.id, parent, tree]);

  const onKeydown = (e: React.KeyboardEvent) => {
    handleShortcuts({ content, key, value }, e);
  };

  const fade = { "opacity-60": !inSearchMatchPath(node.searchMatch) };

  // TODO rendered text handlers
  return (
    <div
      ref={parentRef}
      className="focus:bg-viewer-focus focus:outline-hidden"
      style={{ ...style, paddingLeft: `${node.nesting}em` }}
      tabIndex={-1}
      onClick={() => parent?.focus()}
      onKeyDown={onKeydown}
    >
      <div ref={contentRef} className={classNames("flex items-start", fade)}>
        <OpenButton
          className="shrink-0"
          enabled={!node.isLeaf}
          isOpen={node.isOpen}
          toggleOpen={() => tree.toggleOpen(node.id)}
        />
        <Key
          ref={keyRef}
          nodeKey={node.key}
          searchMatches={node.searchMatch?.keyMatches ?? []}
        />
        <Value
          ref={valueRef}
          className="grow"
          node={node}
          searchMatches={node.searchMatch?.valueMatches ?? []}
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

function inSearchMatchPath(searchMatch: Nullable<NodeSearchMatch>): boolean {
  return (
    !searchMatch ||
    searchMatch.inKey ||
    searchMatch.inDescendant ||
    searchMatch.inValue
  );
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

  if ((e.shiftKey && e.key == "ArrowLeft") || isUpperCaseKeypress(e, "H")) {
    e.preventDefault();
    key?.selectText();
    return;
  }

  if ((e.shiftKey && e.key == "ArrowRight") || isUpperCaseKeypress(e, "L")) {
    e.preventDefault();
    value?.selectText();
    return;
  }
}
