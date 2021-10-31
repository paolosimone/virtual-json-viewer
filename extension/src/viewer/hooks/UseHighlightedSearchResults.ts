import { ReactNode, useMemo } from "react";
import { Search } from "viewer/commons/state";
import { HighlightedText } from "viewer/components";

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
  if (!search || !text) {
    return text;
  }

  return HighlightedText({
    text: text,
    selection: search.text,
  });
}
