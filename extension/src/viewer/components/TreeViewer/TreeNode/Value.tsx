import classNames from "classnames";
import * as Json from "viewer/commons/Json";
import { useHighlightedSearchResults } from "viewer/hooks";
import { Search } from "viewer/state";
import { JsonNodeData } from "../model/JsonNode";

export type ValueProps = {
  data: JsonNodeData;
  isOpen: boolean;
  search: Nullable<Search>;
};

export function Value({
  data: { value, childrenCount },
  isOpen,
  search,
}: ValueProps): JSX.Element {
  if (isOpen) {
    return <span />;
  }

  if (Json.isCollection(value)) {
    return (
      <CollectionValue value={value} childrenCount={childrenCount as number} />
    );
  }

  return <LiteralValue value={value} search={search} />;
}

type CollectionValueProps = Props<{
  value: Json.Collection;
  childrenCount: number;
}>;

function CollectionValue({
  value,
  childrenCount,
}: CollectionValueProps): JSX.Element {
  const count = childrenCount ? ` ${childrenCount} ` : "";
  const preview = Json.isArray(value) ? `[${count}]` : `{${count}}`;
  const fade = { "opacity-50": childrenCount };
  return (
    <span
      className={classNames("truncate text-gray-600 dark:text-gray-300", fade)}
    >
      {preview}
    </span>
  );
}

type LiteralValueProps = Props<{
  value: Json.Literal;
  search: Nullable<Search>;
}>;

function LiteralValue({ value, search }: LiteralValueProps): JSX.Element {
  const textColor = Json.isString(value)
    ? "text-pink-600 dark:text-pink-400"
    : "text-green-600 dark:text-green-400";
  const textValue = literalToString(value);
  const highlightedText = useHighlightedSearchResults(textValue, search);
  return (
    <span className={classNames("whitespace-pre-wrap", textColor)}>
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
