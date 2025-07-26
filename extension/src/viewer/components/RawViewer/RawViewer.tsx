import * as DOM from "@/viewer/commons/Dom";
import { EventType } from "@/viewer/commons/EventBus";
import * as Json from "@/viewer/commons/Json";
import {
  buildMatches,
  MatchesCollection,
  RenderedText,
  SEARCH_MATCH_HANDLER_PLACEHOLDER,
  SearchMatchHandler,
} from "@/viewer/components";
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
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { uid } from "uid";

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

  const renderedLinesProps = useMemo(
    () => ({ rawLines, search, isLargeJson }),
    [rawLines, search, isLargeJson],
  );

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
        {...renderedLinesProps}
        onSearchMatchesUpdate={(handlers) => navigator.current.reset(handlers)}
      />
    </div>
  );
}

export type SearchNavigationCallback = (navigation: SearchNavigation) => void;

class SearchMatchNavigator {
  private handlers: SearchMatchHandler[] = [];
  private currentIndex: Nullable<number> = null;
  private onNavigation?: SearchNavigationCallback;

  public reset(handlers: SearchMatchHandler[]) {
    this.handlers = handlers;
    this.currentIndex = null;
    this.notifyNavigation();
  }

  public observeNavigation(callback: SearchNavigationCallback) {
    this.onNavigation = callback;
  }

  public matchesCount() {
    return this.handlers.length;
  }

  public goToPreviousMatch() {
    if (!this.handlers.length) return;
    const index = (this.currentIndex || this.handlers.length) - 1;
    this.goToIndex(index);
  }

  public goToNextMatch() {
    if (!this.handlers.length) return;
    const index = ((this.currentIndex ?? -1) + 1) % this.handlers.length;
    this.goToIndex(index);
  }

  private goToIndex(index: number) {
    // Deselect previous match
    if (this.currentIndex !== null) {
      this.handlers[this.currentIndex].setSelected(false);
    }

    // update current index
    this.currentIndex = index;

    // go to the new match
    const handler = this.handlers[index];
    handler.setSelected(true);
    handler.scrollIntoView();

    // notify the change
    this.notifyNavigation();
  }

  private notifyNavigation() {
    if (this.onNavigation) {
      this.onNavigation({
        currentIndex: this.currentIndex,
        totalCount: this.handlers.length,
      });
    }
  }
}

type RenderedLinesProps = {
  rawLines: string[];
  search: Nullable<Search>;
  isLargeJson: boolean;
  onSearchMatchesUpdate: (searchMatches: SearchMatchHandler[]) => void;
};

function RenderedLines({
  rawLines,
  search,
  isLargeJson,
  onSearchMatchesUpdate,
}: RenderedLinesProps): ReactNode {
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

  const lineMatches = useMemo(() => {
    let lineMatches: LineMatches[] = [];

    let searchOffset = 0;
    for (const text of rawLines) {
      const matches = buildMatches(text, search, linkifyUrls);
      lineMatches.push({ searchOffset, matches });
      searchOffset += matches.searchMatches.length;
    }

    return lineMatches;
  }, [rawLines, search, linkifyUrls]);

  // linearize handlers placeholders
  const searchMatchesHandler = useMemo(() => {
    return lineMatches.flatMap((line) =>
      line.matches.searchMatches.map(() => SEARCH_MATCH_HANDLER_PLACEHOLDER),
    );
  }, [lineMatches]);

  // use effect to register linearized search matches
  useEffect(() => {
    onSearchMatchesUpdate(searchMatchesHandler);
  }, [searchMatchesHandler]);

  return rawLines
    .flatMap((text, lineIndex) => [
      <br key={uid()} />,
      <RenderedText
        key={lineIndex}
        text={text}
        matches={lineMatches[lineIndex].matches}
        ref={(ref) => {
          ref?.searchMatches.forEach((handler, matchIndex) => {
            searchMatchesHandler[
              lineMatches[lineIndex].searchOffset + matchIndex
            ] = handler;
          });
        }}
      />,
    ])
    .slice(1);
}

type LineMatches = {
  searchOffset: number;
  matches: MatchesCollection;
};
