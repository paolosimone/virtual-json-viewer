import { Search } from "@/viewer/state";
import { ReactNode, useEffect, useMemo } from "react";
import { uid } from "uid";
import {
  findMatches,
  MatchesResult,
  RenderedText,
  SearchMatchHandler,
} from "../RenderedText";

export type RenderedLinesProps = {
  rawLines: string[];
  search: Nullable<Search>;
  linkifyUrls: boolean;
  onSearchMatchesUpdate: (searchMatches: SearchMatchHandler[]) => void;
};

export function RenderedLines({
  rawLines,
  search,
  linkifyUrls,
  onSearchMatchesUpdate,
}: RenderedLinesProps): ReactNode {
  // Find all matches in each line
  const lineMatches = useMemo(() => {
    const lineMatches = new LineMatchesFlattener();
    rawLines.forEach((text) => {
      lineMatches.add(findMatches(text, search, linkifyUrls));
    });
    return lineMatches;
  }, [rawLines, search, linkifyUrls]);

  // Register the search matches placeholders in the caller.
  // Handlers will (should?) be already resolved by the time this effect runs.
  useEffect(() => {
    onSearchMatchesUpdate(lineMatches.getFlattenedHandlers());
  }, [lineMatches]);

  // Resolve search matches handlers when they are rendered
  function resolveLineHandlers(
    lineIndex: number,
    handlers: SearchMatchHandler[] | undefined,
  ) {
    if (!handlers) return;
    lineMatches.resolveLineHandlers(lineIndex, handlers);
  }

  return rawLines
    .flatMap((text, lineIndex) => [
      <br key={uid()} />,

      <RenderedText
        key={lineIndex}
        text={text}
        matches={lineMatches.get(lineIndex)}
        // Resolve the search matches handlers
        ref={(ref) => resolveLineHandlers(lineIndex, ref?.searchMatches)}
      />,
    ])
    .slice(1);
}

type LineMatches = {
  searchOffset: number;
  matches: MatchesResult;
};

class LineMatchesFlattener {
  private lineMatches: LineMatches[] = [];
  private flatHandlers: SearchMatchHandler[] = [];

  public add(matches: MatchesResult) {
    this.lineMatches.push({ searchOffset: this.flatHandlers.length, matches });

    for (let i = 0; i < matches.searchMatches.length; i++) {
      this.flatHandlers.push(SEARCH_MATCH_HANDLER_PLACEHOLDER);
    }
  }

  public get(lineIndex: number): MatchesResult {
    return this.lineMatches[lineIndex].matches;
  }

  public getFlattenedHandlers(): SearchMatchHandler[] {
    return this.flatHandlers;
  }

  public resolveLineHandlers(
    lineIndex: number,
    handlers: SearchMatchHandler[],
  ) {
    handlers.forEach((handler, matchIndex) => {
      const flatIndex = this.lineMatches[lineIndex].searchOffset + matchIndex;
      this.flatHandlers[flatIndex] = handler;
    });
  }
}

const SEARCH_MATCH_HANDLER_PLACEHOLDER: SearchMatchHandler = {
  setSelected: () => {},
  scrollIntoView: () => {},
};
