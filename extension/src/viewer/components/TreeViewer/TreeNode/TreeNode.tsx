import * as DOM from "@/viewer/commons/Dom";
import {
  CHORD_KEY,
  isUpperCaseKeypress,
  RefCurrent,
  useFocus,
  useHover,
  useReactiveRef,
} from "@/viewer/hooks";
import classNames from "classnames";
import { JSX, useEffect } from "react";
import { NodeSearchMatch, TreeNodeProps } from "../Tree";
import { TreeContext } from "../TreeContext";
import { NodePart, TreeNavigatorNodeHandler } from "../TreeNavigator";
import { EnterButton, EnterButtonHandle } from "./EnterButton";
import { Key, KeyHandle } from "./Key";
import { OpenButton } from "./OpenButton";
import { Value, ValueHandle } from "./Value";

export function TreeNode({
  context: { tree, enableEnterNode },
  node,
  style,
}: TreeNodeProps<TreeContext>): JSX.Element {
  const [parent, parentRef] = useReactiveRef<HTMLDivElement>();
  const [content, contentRef] = useReactiveRef<HTMLDivElement>();
  const [key, keyRef] = useReactiveRef<KeyHandle>();
  const [value, valueRef] = useReactiveRef<ValueHandle>();
  const [enter, enterRef] = useReactiveRef<EnterButtonHandle>();

  // Track DOM events
  const hasFocus = useFocus(parent);
  const isHovered = useHover(parent);

  // Registers the node's html handler in the navigator
  useEffect(() => {
    if (!parent) return;

    let focusCallback = () => {};
    const stableFocusCallback = () => focusCallback();

    const handler: TreeNavigatorNodeHandler = {
      focus() {
        parent.focus();
      },
      listenOnFocus(callback) {
        focusCallback = callback;
      },
      blur() {
        parent.blur();
      },
      getMatchHandler(part, index) {
        const ref = part === NodePart.Key ? key : value;
        return ref?.getMatchHandler(index);
      },
    };

    parent.addEventListener("focus", stableFocusCallback);
    tree.onNodeShown(node.id, handler);
    return () => {
      tree.onNodeHidden(node.id);
      parent.removeEventListener("focus", stableFocusCallback);
    };
  }, [tree, node.id, parent, key, value]);

  // Enter button visibility
  const enterEnabled = enableEnterNode && (hasFocus || isHovered);

  // Shortcuts
  const onKeydown = (e: React.KeyboardEvent) => {
    handleShortcuts({ content, key, value, enter }, e);
  };

  const fade = { "opacity-60": !inSearchMatchPath(node.searchMatch) };

  return (
    <div
      ref={parentRef}
      className={classNames(
        "focus:outline-viewer-foreground focus:outline-1 focus:-outline-offset-1 focus:outline-solid",
        "hover:bg-viewer-focus",
      )}
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
        <EnterButton
          ref={enterRef}
          className="shrink-0"
          enabled={enterEnabled}
          node={node}
        />
      </div>
    </div>
  );
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
  enter: RefCurrent<EnterButtonHandle>;
};

function handleShortcuts(
  { content, key, value, enter }: NodeRefs,
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

  if (e.key === "Enter") {
    e.preventDefault();
    enter?.enter();
    return;
  }
}
