import * as DOM from "@/viewer/commons/Dom";
import * as Json from "@/viewer/commons/Json";
import { useRenderedText } from "@/viewer/hooks";
import { Search } from "@/viewer/state";
import classNames from "classnames";
import {
  ForwardedRef,
  forwardRef,
  JSX,
  useImperativeHandle,
  useRef,
} from "react";
import { NodeState } from "../Tree";

export type KeyProps = Props<{
  node: NodeState;
  search: Nullable<Search>;
}>;

export type KeyHandle = {
  selectText: () => void;
};

export const Key = forwardRef(function Key(
  props: KeyProps,
  ref: ForwardedRef<KeyHandle>,
): JSX.Element {
  if (props.node.key === null) {
    return <span />;
  }

  const keyRef = useRef<HTMLSpanElement>(null);
  useImperativeHandle(
    ref,
    () => ({
      selectText() {
        if (keyRef.current) DOM.selectAllText(keyRef.current);
      },
    }),
    [keyRef],
  );

  const KeyElement = Json.isNumber(props.node.key) ? ArrayKey : ObjectKey;

  return (
    <KeyElement
      ref={keyRef}
      className={classNames(
        "text-json-key mr-4 whitespace-pre-wrap",
        props.className,
      )}
      {...props}
    />
  );
});

const ArrayKey = forwardRef(function ArrayKey(
  { node, className }: KeyProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  return (
    <span className={className}>
      <span ref={ref}>{node.key}</span>
      <span>:</span>
    </span>
  );
});

const ObjectKey = forwardRef(function ObjectKey(
  { node, search, className }: KeyProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  const highlightedKey = useRenderedText(node.key as string, search);

  return (
    <span className={className}>
      <span ref={ref}>{highlightedKey}</span>
      <span>:</span>
    </span>
  );
});
