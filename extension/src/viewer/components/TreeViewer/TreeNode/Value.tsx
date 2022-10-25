import classNames from "classnames";
import * as Json from "viewer/commons/Json";
import { useRenderedText } from "viewer/hooks";
import { Search } from "viewer/state";
import { JsonNodeData } from "../model/JsonNode";
import { TreeNavigator } from "../TreeNavigator";

export type ValueProps = Props<{
  data: JsonNodeData;
  treeNavigator: TreeNavigator;
  search: Nullable<Search>;
}>;

export function Value({
  data: { id, value, childrenCount },
  treeNavigator,
  search,
  className,
}: ValueProps): JSX.Element {
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

  return <LiteralValue className={className} value={value} search={search} />;
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
}>;

function LiteralValue({
  value,
  search,
  className,
}: LiteralValueProps): JSX.Element {
  const textColor = Json.isString(value)
    ? "text-json-string"
    : "text-json-value";
  const textValue = literalToString(value);
  const highlightedText = useRenderedText(textValue, search);
  return (
    <span className={classNames("whitespace-pre-wrap", textColor, className)}>
      {highlightedText}
    </span>
  );
}

function literalToString(value: Json.Literal): string {
  if (Json.isString(value)) {
    return `"${value}"`;
  }

  return value?.toString() ?? "null";
}
