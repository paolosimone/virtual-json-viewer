import classNames from "classnames";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { EventType } from "viewer/commons/EventBus";
import * as Json from "viewer/commons/Json";
import {
  CHORD_KEY,
  useEventBusListener,
  useKeydownEvent,
  useRenderedText,
} from "viewer/hooks";
import { Search, SettingsContext } from "viewer/state";

export type RawViewerProps = Props<{
  json: Json.Root;
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

  const raw = useMemo(
    () => Json.toString(json, { sortKeys: true, space: space }),
    [json, space]
  );

  const highlightedText = useRenderedText(raw, search);

  // add select all text shortcut
  const ref = useRef<HTMLDivElement>(null);
  const onSelectAll = useCallback(
    (e: KeyboardEvent) => {
      if (e[CHORD_KEY] && e.key == "a") {
        e.preventDefault();
        if (ref.current) selectAllText(ref.current);
      }
    },
    [ref.current]
  );
  useKeydownEvent(onSelectAll, ref);

  const wrap = minify ? "break-all" : "whitespace-pre";

  return (
    <div
      ref={ref}
      tabIndex={0}
      className={classNames("overflow-auto", wrap, className)}
      spellCheck={false}
    >
      {highlightedText}
    </div>
  );
}

// html element must be focusable
function selectAllText(elem: HTMLElement) {
  const range = document.createRange();
  range.selectNode(elem);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
