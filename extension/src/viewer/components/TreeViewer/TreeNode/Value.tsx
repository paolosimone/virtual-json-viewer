import * as DOM from "@/viewer/commons/Dom";
import * as Json from "@/viewer/commons/Json";
import { useRenderedText } from "@/viewer/hooks";
import { Search } from "@/viewer/state";
import classNames from "classnames";
import { JSX, Ref, useImperativeHandle, useRef } from "react";
import { NodeState } from "../Tree";

export type ValueHandle = {
  selectText: () => void;
};

export type ValueProps = Props<{
  node: NodeState;
  search: Nullable<Search>;
  ref?: Ref<ValueHandle>;
}>;

export function Value({
  node: { value, children, isOpen },
  search,
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
      search={search}
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
  search: Nullable<Search>;
  ref?: Ref<ValueHandle>;
}>;

export function LiteralValue({
  value,
  search,
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

  const textValue = value?.toString() ?? "null";
  const highlightedText = useRenderedText(textValue, search);

  const isString = Json.isString(value);
  const textColor = isString ? "text-json-string" : "text-json-value";

  return (
    <span className={classNames("whitespace-pre-wrap", textColor, className)}>
      {isString && <span>&quot;</span>}
      <span ref={valueRef}>{highlightedText}</span>
      {isString && <span>&quot;</span>}
    </span>
  );
}
