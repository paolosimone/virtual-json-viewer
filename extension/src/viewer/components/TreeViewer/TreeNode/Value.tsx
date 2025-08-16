import * as DOM from "@/viewer/commons/Dom";
import * as Json from "@/viewer/commons/Json";
import { SearchMatchRange } from "@/viewer/commons/Searcher";
import classNames from "classnames";
import { JSX, Ref, useImperativeHandle, useRef } from "react";
import { NodeState } from "../Tree";
import { RenderedTextFromSearch } from "./RenderedTextFromSearch";

export type ValueHandle = {
  selectText: () => void;
};

export type ValueProps = Props<{
  node: NodeState;
  searchMatches: SearchMatchRange[];
  ref?: Ref<ValueHandle>;
}>;

export function Value({
  node: { value, children, isOpen },
  searchMatches,
  className,
  ref,
}: ValueProps): JSX.Element {
  if (isOpen) {
    return <span />;
  }

  if (Json.isCollection(value)) {
    return (
      <CollectionValue
        className={className}
        value={value}
        childrenCount={children.length}
      />
    );
  }

  return (
    <LiteralValue
      ref={ref}
      className={className}
      value={value}
      searchMatches={searchMatches}
    />
  );
}

type CollectionValueProps = Props<{
  value: Json.Collection;
  childrenCount: number;
}>;

function CollectionValue({
  value,
  childrenCount,
  className,
}: CollectionValueProps): JSX.Element {
  const count = childrenCount ? ` ${childrenCount} ` : "";
  const preview = Json.isArray(value) ? `[${count}]` : `{${count}}`;
  const color = childrenCount
    ? "text-viewer-foreground opacity-40"
    : "text-json-value";
  return (
    <span className={classNames("truncate", color, className)}>{preview}</span>
  );
}

type LiteralValueProps = Props<{
  value: Json.Literal;
  searchMatches: SearchMatchRange[];
  ref?: Ref<ValueHandle>;
}>;

export function LiteralValue({
  value,
  searchMatches,
  className,
  ref,
}: LiteralValueProps): JSX.Element {
  const valueRef = useRef<HTMLSpanElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      selectText() {
        if (valueRef.current) DOM.selectAllText(valueRef.current);
      },
    }),
    [valueRef],
  );

  const isString = Json.isString(value);
  const textColor = isString ? "text-json-string" : "text-json-value";

  const textValue = value?.toString() ?? "null";

  return (
    <span className={classNames("whitespace-pre-wrap", textColor, className)}>
      {isString && <span>&quot;</span>}
      <span ref={valueRef}>
        <RenderedTextFromSearch
          text={textValue}
          searchMatches={searchMatches}
        />
      </span>
      {isString && <span>&quot;</span>}
    </span>
  );
}
