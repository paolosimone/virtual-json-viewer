import { ReactNode, useMemo } from "react";
import { HighlightedText } from "viewer/components";
import { Search } from "viewer/state";

export function useHighlightedSearchResults(
  text: Nullable<string>,
  search: Nullable<Search>
): ReactNode[] | Nullable<string> {
  return useMemo(
    () => maybeHighlightSearchResults(text, search),
    [text, search]
  );
}

function maybeHighlightSearchResults(
  text: Nullable<string>,
  search: Nullable<Search>
): ReactNode[] | Nullable<string> {
  if (!search?.text || !text) {
    return text;
  }

  return HighlightedText({
    text: text,
    selection: search.text,
    caseSensitive: search.caseSensitive,
  });
}
