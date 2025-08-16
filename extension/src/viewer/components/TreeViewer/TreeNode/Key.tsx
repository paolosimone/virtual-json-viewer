import * as DOM from "@/viewer/commons/Dom";
import * as Json from "@/viewer/commons/Json";
import { SearchMatchRange } from "@/viewer/commons/Searcher";
import classNames from "classnames";
import { JSX, Ref, useImperativeHandle, useRef } from "react";
import { RenderedTextFromSearch } from "./RenderedTextFromSearch";

export type KeyHandle = {
  selectText: () => void;
};

export type KeyProps = Props<{
  nodeKey: Nullable<Json.Key>;
  searchMatches: SearchMatchRange[];
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
      searchMatches={props.searchMatches}
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
  searchMatches: SearchMatchRange[];
  ref?: Ref<HTMLSpanElement>;
}>;

function ObjectKey({
  nodeKey,
  searchMatches,
  className,
  ref,
}: ObjectKeyProps): JSX.Element {
  return (
    <span className={className}>
      <span ref={ref}>
        <RenderedTextFromSearch text={nodeKey} searchMatches={searchMatches} />
      </span>
      <span>:</span>
    </span>
  );
}
