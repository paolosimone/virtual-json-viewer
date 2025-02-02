import classNames from "classnames";
import {
  JSX,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as DOM from "viewer/commons/Dom";
import { EventType } from "viewer/commons/EventBus";
import * as Json from "viewer/commons/Json";
import { RenderedText } from "viewer/components";
import {
  CHORD_KEY,
  KeydownEvent,
  useEventBusListener,
  useGlobalKeydownEvent,
} from "viewer/hooks";
import { Search, SettingsContext } from "viewer/state";
import { uid } from "uid";

export type RawViewerProps = Props<{
  jsonLines: Json.Lines;
  search: Search;
  isLargeJson: boolean;
}>;

export function RawViewer({
  jsonLines,
  search,
  isLargeJson,
  className,
}: RawViewerProps): JSX.Element {
  const { indentation, sortKeys } = useContext(SettingsContext);
  const [minify, setMinify] = useState(false);

  const expand = useCallback(() => setMinify(false), [setMinify]);
  useEventBusListener(EventType.Expand, expand);

  const collapse = useCallback(() => setMinify(true), [setMinify]);
  useEventBusListener(EventType.Collapse, collapse);

  const space = minify ? undefined : indentation;

  const rawLines = useMemo(
    () => jsonLines.map((line) => Json.toString(line, { sortKeys, space })),
    [jsonLines, sortKeys, space],
  );

  const renderedLines = useRenderedLines(rawLines, search, isLargeJson);

  const ref = useRef<Nullable<HTMLDivElement>>(null);

  // register shortcuts
  const handleNavigation = useCallback(
    (e: KeydownEvent) => {
      if (e[CHORD_KEY] && e.key === "0") {
        e.preventDefault();
        ref.current?.focus();
      }
    },
    [ref],
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
      {renderedLines}
    </div>
  );
}

function useRenderedLines(
  rawlines: string[],
  search: Nullable<Search>,
  isLargeJson: boolean,
): ReactNode {
  const { linkifyUrls: linkifyUrlsSettings } = useContext(SettingsContext);

  // linkifyUrls is disabled for large text to improve performance
  const linkifyUrls = linkifyUrlsSettings && !isLargeJson;
  useEffect(() => {
    if (linkifyUrlsSettings && !linkifyUrls) {
      console.info(
        "Large amount of text detected: Linkify URL has been disable to improve performance",
      );
    }
  }, [isLargeJson, linkifyUrlsSettings]);

  return useMemo(
    () =>
      rawlines
        .flatMap((text) => [
          <br key={uid()} />,
          RenderedText({ text, search, linkifyUrls }),
        ])
        .slice(1),
    [rawlines, search, linkifyUrls],
  );
}
