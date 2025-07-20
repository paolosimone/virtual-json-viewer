import * as DOM from "@/viewer/commons/Dom";
import * as Json from "@/viewer/commons/Json";
import { useRenderedText } from "@/viewer/hooks";
import { Search } from "@/viewer/state";
import classNames from "classnames";
import { JSX, Ref, useImperativeHandle, useRef } from "react";

export type KeyHandle = {
  selectText: () => void;
};

export type KeyProps = Props<{
  nodeKey: Nullable<Json.Key>;
  search: Nullable<Search>;
  ref?: Ref<KeyHandle>;
}>;

export function Key(props: KeyProps): JSX.Element {
  const keyRef = useRef<HTMLSpanElement>(null);
  useImperativeHandle(
    props.ref,
    () => ({
      selectText() {
        if (keyRef.current) DOM.selectAllText(keyRef.current);
      },
    }),
    [keyRef],
  );

  if (props.nodeKey === null) {
    return <span />;
  }

  const className = classNames(
    "text-json-key mr-4 whitespace-pre-wrap",
    props.className,
  );

  if (Json.isNumber(props.nodeKey)) {
    return <ArrayKey className={className} nodeKey={props.nodeKey} />;
  }

  return (
    <ObjectKey
      className={className}
      nodeKey={props.nodeKey}
      search={props.search}
      ref={keyRef}
    />
  );
}

type ArrayKeyProps = Props<{
  nodeKey: number;
}>;

function ArrayKey({ nodeKey, className }: ArrayKeyProps): JSX.Element {
  return (
    <span className={className}>
      <span>{nodeKey}</span>
      <span>:</span>
    </span>
  );
}

type ObjectKeyProps = Props<{
  nodeKey: string;
  search: Nullable<Search>;
  ref?: Ref<HTMLSpanElement>;
}>;

function ObjectKey({
  nodeKey,
  search,
  className,
  ref,
}: ObjectKeyProps): JSX.Element {
  const highlightedKey = useRenderedText(nodeKey, search);

  return (
    <span className={className}>
      <span ref={ref}>{highlightedKey}</span>
      <span>:</span>
    </span>
  );
}
