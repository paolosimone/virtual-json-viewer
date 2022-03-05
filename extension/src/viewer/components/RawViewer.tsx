import classNames from "classnames";
import {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EventType } from "viewer/commons/EventBus";
import * as Json from "viewer/commons/Json";
import { useEventBusListener, useHighlightedSearchResults } from "viewer/hooks";
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

  const highlightedText = useHighlightedSearchResults(raw, search);

  const ref = useRef<HTMLDivElement>(null);
  useSelectAllText(ref);

  const wrap = minify ? "break-all" : "whitespace-pre";

  return (
    <div
      ref={ref}
      className={classNames("overflow-auto", wrap, className)}
      spellCheck={false}
    >
      {highlightedText}
    </div>
  );
}

function useSelectAllText(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    function selectAll(e: KeyboardEvent) {
      if (!ref.current) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key == "a") {
        e.preventDefault();
        selectAllText(ref.current);
      }
    }

    document.addEventListener("keydown", selectAll);
    return () => document.removeEventListener("keydown", selectAll);
  }, [ref]);
}

function selectAllText(node: HTMLElement) {
  const range = document.createRange();
  range.selectNode(node);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
