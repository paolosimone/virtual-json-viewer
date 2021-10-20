import * as J from "viewer/commons/JsonUtils";
import { JsonNodeData } from "../model/JsonNode";

export type ValueProps = {
  data: JsonNodeData;
  isOpen: boolean;
};

export function Value({
  data: { value, childrenCount },
  isOpen,
}: ValueProps): JSX.Element {
  if (isOpen) {
    return <span />;
  }

  if (J.isCollection(value)) {
    const count = childrenCount ? `↤ ${childrenCount} ↦` : "";
    const preview = J.isArray(value) ? `[${count}]` : `{${count}}`;
    return <span className="truncate text-gray-600">{preview}</span>;
  }

  if (J.isString(value)) {
    return <span className="whitespace-pre-wrap text-pink-600">"{value}"</span>;
  }

  return <span className="text-green-600">{value?.toString() ?? "null"}</span>;
}