import { Search } from "viewer/commons/state";
import { useHighlightedSearchResults } from "viewer/hooks";
import { JsonNodeData } from "../model/JsonNode";

export type KeyProps = {
  data: JsonNodeData;
  search: Nullable<Search>;
};

export function Key({ data, search }: KeyProps): JSX.Element {
  const highlightedText = useHighlightedSearchResults(data.key, search);

  if (isRootLiteral(data)) {
    return <span />;
  }

  return (
    <span className="mr-4 whitespace-pre-wrap text-blue-700 dark:text-blue-400">
      {highlightedText}:
    </span>
  );
}

function isRootLiteral({ key, parent }: JsonNodeData): boolean {
  return !key && !parent;
}
