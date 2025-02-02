import classNames from "classnames";
import {
  ForwardedRef,
  forwardRef,
  JSX,
  useImperativeHandle,
  useRef,
} from "react";
import * as DOM from "viewer/commons/Dom";
import * as Json from "viewer/commons/Json";
import { useRenderedText } from "viewer/hooks";
import { Search } from "viewer/state";
import { TreeNavigator } from "../TreeNavigator";
import { JsonNodeData } from "../model/JsonNode";

export type ValueProps = Props<{
  data: JsonNodeData;
  treeNavigator: TreeNavigator;
  search: Nullable<Search>;
}>;

export type ValueHandle = {
  selectText: () => void;
};

export const Value = forwardRef(function Value(
  {
    data: { id, value, childrenCount },
    treeNavigator,
    search,
    className,
  }: ValueProps,
  ref: ForwardedRef<ValueHandle>,
): JSX.Element {
  if (treeNavigator.isOpen(id)) {
    return <span />;
  }

  if (Json.isCollection(value)) {
    return (
      <CollectionValue
        className={className}
        value={value}
        childrenCount={childrenCount as number}
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
});

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
}>;

export const LiteralValue = forwardRef(function LiteralValue(
  { value, search, className }: LiteralValueProps,
  ref: ForwardedRef<ValueHandle>,
): JSX.Element {
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
});
