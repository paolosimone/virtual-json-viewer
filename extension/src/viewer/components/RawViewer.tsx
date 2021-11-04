import classNames from "classnames";
import { useCallback, useContext, useMemo, useState } from "react";
import { EventType } from "viewer/commons/EventBus";
import { useEventBusListener, useHighlightedSearchResults } from "viewer/hooks";
import { Search, SettingsContext } from "viewer/state";

export type RawViewerProps = Props<{
  json: Json;
  search: Search;
}>;

export function RawViewer({
  json,
  search,
  className,
}: RawViewerProps): JSX.Element {
  const { indentation } = useContext(SettingsContext);
  const [minify, setMinify] = useState(false);

  const expand = useCallback(() => setMinify(false), [setMinify]);
  useEventBusListener(EventType.Expand, expand);

  const collapse = useCallback(() => setMinify(true), [setMinify]);
  useEventBusListener(EventType.Collapse, collapse);

  const space = minify ? undefined : indentation;
  console.log(space);

  const raw = useMemo(
    () => JSON.stringify(json, undefined, space),
    [json, space]
  );

  const highlightedText = useHighlightedSearchResults(raw, search);

  const wrap = minify ? "whitespace-pre-wrap" : "whitespace-pre";

  return (
    <div className={classNames(wrap, className)} spellCheck={false}>
      {highlightedText}
    </div>
  );
}
