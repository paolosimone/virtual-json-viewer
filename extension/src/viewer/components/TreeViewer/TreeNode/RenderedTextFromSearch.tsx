import { SearchMatchRange } from "@/viewer/commons/Searcher";
import {
  matchLinks,
  RenderedText,
  RenderedTextRef,
  searchMatchFromSearcher,
} from "@/viewer/components/RenderedText";
import { SettingsContext } from "@/viewer/state";
import { ReactNode, Ref, useContext, useMemo } from "react";

export type {
  RenderedTextRef,
  SearchMatchHandler,
} from "@/viewer/components/RenderedText";

export type RenderedTextFromSearchProps = Props<{
  text: string;
  searchMatches: SearchMatchRange[];
  ref?: Ref<RenderedTextRef>;
}>;

export function RenderedTextFromSearch({
  text,
  searchMatches,
  ref,
}: RenderedTextFromSearchProps): ReactNode {
  const { linkifyUrls } = useContext(SettingsContext);

  const matches = useMemo(
    () => ({
      searchMatches: searchMatches.map(searchMatchFromSearcher),
      linkMatches: linkifyUrls ? matchLinks(text) : [],
    }),
    [searchMatches, linkifyUrls, text],
  );

  return <RenderedText ref={ref} text={text} matches={matches} />;
}
