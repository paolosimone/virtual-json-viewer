import classNames from "classnames";
import * as Json from "viewer/commons/Json";
import { useRenderedText } from "viewer/hooks";
import { Search } from "viewer/state";
import { JsonNodeData } from "../model/JsonNode";

export type KeyProps = Props<{
  data: JsonNodeData;
  search: Nullable<Search>;
}>;

export function Key(props: KeyProps): JSX.Element {
  if (props.data.key === null) {
    return <span />;
  }

  const KeyElement = Json.isNumber(props.data.key) ? ArrayKey : ObjectKey;

  return (
    <KeyElement
      className={classNames(
        "mr-4 whitespace-pre-wrap text-json-key",
        props.className
      )}
      {...props}
    />
  );
}

function ArrayKey({ data, className }: KeyProps): JSX.Element {
  return <span className={className}>{data.key}:</span>;
}

function ObjectKey({ data, search, className }: KeyProps): JSX.Element {
  const highlightedKey = useRenderedText(data.key as string, search);

  return <span className={className}>{highlightedKey}:</span>;
}
