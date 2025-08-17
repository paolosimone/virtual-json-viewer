import { buildSearcher, SearchMatchRange } from "@/viewer/commons/Searcher";
import classNames from "classnames";
import { JSX, Ref, useImperativeHandle, useRef, useState } from "react";
import { uid } from "uid";
import { Match } from "./Match";

export const SEARCH_TYPE = "search";

export interface SearchMatch extends Match<EmptyObject> {
  type: typeof SEARCH_TYPE;
}

// Rendering

export interface SearchedTextHandler {
  setSelected: (selected: boolean) => void;
  scrollIntoView: () => void;
}

export type SearchedTextProps = Props<{
  ref?: Ref<SearchedTextHandler>;
}>;

export function SearchedText({
  ref,
  children,
}: SearchedTextProps): JSX.Element {
  const [selected, setSelected] = useState(false);
  const markRef = useRef<HTMLElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      setSelected,
      scrollIntoView: () => markRef.current?.scrollIntoView(),
    }),
    [setSelected, markRef],
  );

  const background = selected ? "bg-orange-400" : "bg-yellow-300";

  return (
    <mark ref={markRef} className={classNames(background, "text-black")}>
      {children}
    </mark>
  );
}

// Matching

export function matchSearch(
  text: string,
  searchText: string,
  caseSensitive?: boolean,
): SearchMatch[] {
  const searcher = buildSearcher(searchText, caseSensitive);
  return searcher.findMatches(text).map(searchMatchFromSearcher);
}

export function searchMatchFromSearcher(match: SearchMatchRange): SearchMatch {
  return {
    id: uid(),
    start: match.start,
    end: match.end,
    type: SEARCH_TYPE,
    metadata: {},
  };
}
