import classNames from "classnames";
import { useCallback, useMemo, useState } from "react";
import { EventType } from "viewer/commons/EventBus";
import { useEventBusListener, useHighlightedSearchResults } from "viewer/hooks";
import { Search } from "viewer/state";

export type RawViewerProps = Props<{
  json: Json;
  search: Search;
}>;

// TODO setting tab size

const TAB_SIZE = 2;

export function RawViewer({
  json,
  search,
  className,
}: RawViewerProps): JSX.Element {
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

  // TODO setting highlight

  const highlightedText = useHighlightedSearchResults(raw, search);

  const wrap = minify ? "whitespace-pre-wrap" : "whitespace-pre";

  return (
    <div className={classNames(wrap, className)} spellCheck={false}>
      {highlightedText}
    </div>
  );
}
