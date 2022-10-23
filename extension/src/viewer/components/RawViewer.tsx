import classNames from "classnames";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { EventType } from "viewer/commons/EventBus";
import * as Json from "viewer/commons/Json";
import {
  CHORD_KEY,
  KeydownEvent,
  RefCurrent,
  useEventBusListener,
  useGlobalKeydownEvent,
  useLazyRenderedText,
} from "viewer/hooks";
import { Search, SettingsContext } from "viewer/state";
import { ViewerPlaceholder } from "./ViewerPlaceholder";

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

  const { renderedText, isLoading } = useLazyRenderedText(raw, search);

  const ref = useRef<HTMLDivElement>(null);

  // register shortcuts
  const hanldeNavigation = useCallback(
    (e: KeydownEvent) => {
      if (e[CHORD_KEY] && e.key === "0") {
        e.preventDefault();
        ref.current?.focus();
      }
    },
    [ref]
  );
  useGlobalKeydownEvent(hanldeNavigation);

  const handleSelectAll = (e: React.KeyboardEvent) => {
    if (e[CHORD_KEY] && e.key == "a") {
      e.preventDefault();
      selectAllText(ref.current);
    }
  };

  const wrap = minify ? "break-all" : "whitespace-pre";

  return (
    <div
      ref={ref}
      tabIndex={0}
      className={classNames("overflow-auto", wrap, className)}
      spellCheck={false}
      onKeyDown={handleSelectAll}
    >
      {isLoading ? <ViewerPlaceholder /> : renderedText}
    </div>
  );
}

// html element must be focusable
function selectAllText(elem: RefCurrent<HTMLElement>) {
  if (!elem) return;
  const range = document.createRange();
  range.selectNode(elem);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
