import classNames from "classnames";
import {
  ForwardedRef,
  forwardRef,
  JSX,
  useImperativeHandle,
  useRef,
} from "react";
import * as DOM from "@/viewer/commons/Dom";
import * as Json from "@/viewer/commons/Json";
import { useRenderedText } from "@/viewer/hooks";
import { Search } from "@/viewer/state";
import { JsonNodeData } from "../model/JsonNode";

export type KeyProps = Props<{
  data: JsonNodeData;
  search: Nullable<Search>;
}>;

export type KeyHandle = {
  selectText: () => void;
};

export const Key = forwardRef(function Key(
  props: KeyProps,
  ref: ForwardedRef<KeyHandle>,
): JSX.Element {
  if (props.data.key === null) {
    return <span />;
  }

  const keyRef = useRef<HTMLSpanElement>(null);
  useImperativeHandle(
    ref,
    () => ({
      selectText() {
        if (keyRef.current) DOM.selectAllText(keyRef.current);
      },
    }),
    [keyRef],
  );

  const KeyElement = Json.isNumber(props.data.key) ? ArrayKey : ObjectKey;

  return (
    <KeyElement
      ref={keyRef}
      className={classNames(
        "mr-4 whitespace-pre-wrap text-json-key",
        props.className,
      )}
      {...props}
    />
  );
});

const ArrayKey = forwardRef(function ArrayKey(
  { data, className }: KeyProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  return (
    <span className={className}>
      <span ref={ref}>{data.key}</span>
      <span>:</span>
    </span>
  );
});

const ObjectKey = forwardRef(function ObjectKey(
  { data, search, className }: KeyProps,
  ref: ForwardedRef<HTMLSpanElement>,
): JSX.Element {
  const highlightedKey = useRenderedText(data.key as string, search);

  return (
    <span className={className}>
      <span ref={ref}>{highlightedKey}</span>
      <span>:</span>
    </span>
  );
});
