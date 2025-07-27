import * as DOM from "@/viewer/commons/Dom";
import { EventType } from "@/viewer/commons/EventBus";
import * as Json from "@/viewer/commons/Json";
import {
  CHORD_KEY,
  KeydownEvent,
  StateObject,
  useEventBusListener,
  useGlobalKeydownEvent,
} from "@/viewer/hooks";
import { Search, SearchNavigation, SettingsContext } from "@/viewer/state";
import classNames from "classnames";
import {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RenderedLines } from "./RenderedLines";
import { SearchMatchNavigator } from "./SearchMatchNavigator";

export type RawViewerProps = Props<{
  jsonLines: Json.Lines;
  search: Search;
  searchNavigationState: StateObject<SearchNavigation>;
  isLargeJson: boolean;
}>;

export function RawViewer({
  jsonLines,
  search,
  isLargeJson,
  searchNavigationState,
  className,
}: RawViewerProps): JSX.Element {
  const { indentation, sortKeys } = useContext(SettingsContext);

  // collapse/expand state
  const [minify, setMinify] = useState(false);

  const expand = useCallback(() => setMinify(false), [setMinify]);
  useEventBusListener(EventType.Expand, expand);

  const collapse = useCallback(() => setMinify(true), [setMinify]);
  useEventBusListener(EventType.Collapse, collapse);

  // linkify URLs
  const linkifyUrls = useLinkifyUrls(isLargeJson, minify);

  // raw text
  const space = minify ? undefined : indentation;

  const rawLines = useMemo(
    () => jsonLines.map((line) => Json.toString(line, { sortKeys, space })),
    [jsonLines, sortKeys, space],
  );

  // navigation
  const navigator = useRef<SearchMatchNavigator>(new SearchMatchNavigator());
  navigator.current.observeNavigation(searchNavigationState.setValue);

  const goToPreviousMatch = useCallback(
    () => navigator.current.goToPreviousMatch(),
    [navigator],
  );
  useEventBusListener(EventType.SearchNavigatePrevious, goToPreviousMatch);

  const goToNextMatch = useCallback(
    () => navigator.current.goToNextMatch(),
    [navigator],
  );
  useEventBusListener(EventType.SearchNavigateNext, goToNextMatch);

  // register shortcuts
  const ref = useRef<Nullable<HTMLDivElement>>(null);
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
      <RenderedLines
        rawLines={rawLines}
        search={search}
        linkifyUrls={linkifyUrls}
        onSearchMatchesUpdate={(handlers) => navigator.current.reset(handlers)}
      />
    </div>
  );
}

function useLinkifyUrls(isLargeJson: boolean, minify: boolean): boolean {
  const { linkifyUrls: linkifyUrlsSettings } = useContext(SettingsContext);

  // disable linkify when collapsed to excessive false positives
  const linkifyUrlsExpected = linkifyUrlsSettings && !minify;

  // disable linkify for large text to improve performance
  const linkifyUrls = linkifyUrlsExpected && !isLargeJson;
  useEffect(() => {
    if (linkifyUrlsExpected && !linkifyUrls) {
      console.info(
        "Large amount of text detected: Linkify URL has been disabled to improve performance",
      );
    }
  }, [linkifyUrlsExpected, isLargeJson]);

  return linkifyUrls;
}
