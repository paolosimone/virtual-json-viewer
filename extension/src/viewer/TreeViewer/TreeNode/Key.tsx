import { JsonNodeData } from "../model/JsonNode";

export type KeyProps = {
  data: JsonNodeData;
};

export function Key({ data }: KeyProps): JSX.Element {
  if (isRootLiteral(data)) {
    return <span />;
  }

  return (
    <span className="mr-4 whitespace-pre-wrap text-blue-600">{data.key}:</span>
  );
}

function isRootLiteral({ key, parent }: JsonNodeData): boolean {
  return !key && !parent;
}
