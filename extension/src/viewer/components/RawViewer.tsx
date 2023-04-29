import classNames from "classnames";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import * as DOM from "viewer/commons/Dom";
import { EventType } from "viewer/commons/EventBus";
import * as Json from "viewer/commons/Json";
import {
  CHORD_KEY,
  KeydownEvent,
  useEventBusListener,
  useGlobalKeydownEvent,
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

  const renderedText = useRenderedText(raw, search);

  const ref = useRef<HTMLDivElement>(null);

  // register shortcuts
  const handleNavigation = useCallback(
    (e: KeydownEvent) => {
      if (e[CHORD_KEY] && e.key === "0") {
        e.preventDefault();
        ref.current?.focus();
      }
    },
    [ref]
  );
  useGlobalKeydownEvent(handleNavigation);

  const handleSelectAll = (e: React.KeyboardEvent) => {
    if (e[CHORD_KEY] && e.key === "a") {
      e.preventDefault();
      if (ref.current) DOM.selectAllText(ref.current);
      return;
    }

    if (e.key == "Escape") {
      e.preventDefault();
      DOM.deselectAllText();
      return;
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
      {renderedText}
    </div>
  );
}
