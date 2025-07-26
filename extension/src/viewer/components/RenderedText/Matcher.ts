import { Search } from "@/viewer/state";
import { matchSearch, SearchMatch } from "./HighlightedText";
import { LinkMatch, matchLinks } from "./LinkifiedText";

export type MatchesResult = {
  searchMatches: SearchMatch[];
  linkMatches: LinkMatch[];
};

export function findMatches(
  text: string,
  search: Nullable<Search>,
  linkifyUrls: boolean,
): MatchesResult {
  const searchMatches = search?.text
    ? matchSearch(text, {
        searchText: search.text,
        caseSensitive: search.caseSensitive,
      })
    : [];

  const linkMatches = linkifyUrls ? matchLinks(text) : [];

  return {
    searchMatches,
    linkMatches,
  };
}
