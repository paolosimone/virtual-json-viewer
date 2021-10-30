import classNames from "classnames";
import { useCallback, useMemo, useState } from "react";
import { EventType } from "viewer/commons/EventBus";
import { useEventBusListener } from "viewer/hooks";

export type RawViewerProps = Props<{
  json: Json;
}>;

// TODO setting tab size

const TAB_SIZE = 2;

export function RawViewer({ json, className }: RawViewerProps): JSX.Element {
  const [minify, setMinify] = useState(false);

  const expand = useCallback(() => setMinify(false), [setMinify]);
  useEventBusListener(EventType.Expand, expand);

  const collapse = useCallback(() => setMinify(true), [setMinify]);
  useEventBusListener(EventType.Collapse, collapse);

  const indent = minify ? undefined : TAB_SIZE;

  const raw = useMemo(
    () => JSON.stringify(json, undefined, indent),
    [json, indent]
  );

  const wrap = minify ? "whitespace-pre-wrap" : "whitespace-pre";

  return (
    <div className={classNames(wrap, className)} spellCheck={false}>
      {raw}
    </div>
  );
}
