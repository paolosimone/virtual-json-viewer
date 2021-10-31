import classNames from "classnames";
import * as J from "viewer/commons/JsonUtils";
import { Search } from "viewer/commons/state";
import { useHighlightedSearchResults } from "viewer/hooks";
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

  if (J.isCollection(value)) {
    return (
      <CollectionValue value={value} childrenCount={childrenCount as number} />
    );
  }

  return <LiteralValue value={value} search={search} />;
}

type CollectionValueProps = Props<{
  value: JsonCollection;
  childrenCount: number;
}>;

function CollectionValue({
  value,
  childrenCount,
}: CollectionValueProps): JSX.Element {
  const count = childrenCount ? ` ${childrenCount} ` : "";
  const preview = J.isArray(value) ? `[${count}]` : `{${count}}`;
  const fade = { "opacity-40": childrenCount };
  return (
    <span className={classNames("truncate text-gray-600", fade)}>
      {preview}
    </span>
  );
}

type LiteralValueProps = Props<{
  value: JsonLiteral;
  search: Nullable<Search>;
}>;

function LiteralValue({ value, search }: LiteralValueProps): JSX.Element {
  const textColor = J.isString(value) ? "text-pink-600" : "text-green-600";
  const textValue = literalToString(value);
  const highlightedText = useHighlightedSearchResults(textValue, search);
  return (
    <span className={classNames("whitespace-pre-wrap", textColor)}>
      {highlightedText}
    </span>
  );
}

function literalToString(value: JsonLiteral): string {
  if (J.isString(value)) {
    return `"${value}"`;
  }

  return value?.toString() ?? "null";
}
