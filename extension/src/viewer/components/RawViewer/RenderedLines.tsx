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
  // find all matches in each line
  const lineMatches = useMemo(() => {
    const lineMatches = new LineMatchesFlattener();
    rawLines.forEach((text) => {
      lineMatches.add(findMatches(text, search, linkifyUrls));
    });
    return lineMatches;
  }, [rawLines, search, linkifyUrls]);

  // register the search matches placeholders in the caller
  useEffect(() => {
    onSearchMatchesUpdate(lineMatches.getFlattenedHandlers());
  }, [lineMatches]);

  // resolve search matches handlers when they are rendered
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
        // resolve the search matches handlers
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
  private searchOffset = 0;
  private flatHandlers: SearchMatchHandler[] = [];

  public add(matches: MatchesResult) {
    this.lineMatches.push({ searchOffset: this.searchOffset, matches });
    this.searchOffset += matches.searchMatches.length;

    for (let i = 0; i < matches.linkMatches.length; i++) {
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
