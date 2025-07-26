import classNames from "classnames";
import { JSX, Ref, useImperativeHandle, useRef, useState } from "react";
import { uid } from "uid";
import { Match } from "./Match";

export const SEARCH_TYPE = "search";

export interface SearchMatch extends Match<EmptyObject> {
  type: typeof SEARCH_TYPE;
}

// Rendering

export interface HighlightedTextHandler {
  setSelected: (selected: boolean) => void;
  scrollIntoView: () => void;
}

export type HighlightedTextProps = Props<{
  ref?: Ref<HighlightedTextHandler>;
}>;

export function HighlightedText({
  ref,
  children,
}: HighlightedTextProps): JSX.Element {
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

export type SearchOptions = Props<{
  searchText: string;
  caseSensitive?: boolean;
}>;

export function matchSearch(
  text: string,
  { searchText, caseSensitive }: SearchOptions,
): SearchMatch[] {
  const flags = "g" + (caseSensitive ? "" : "i");
  const matches = text.matchAll(new RegExp(escapeRegExp(searchText), flags));

  return Array.from(matches, (match) => ({
    id: uid(),
    start: match.index!,
    end: match.index! + searchText.length,
    type: SEARCH_TYPE,
    metadata: {},
  }));
}

// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
