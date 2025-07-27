import { Search, SettingsContext } from "@/viewer/state";
import { ReactNode, useContext, useMemo } from "react";
import { findMatches, RenderedText } from "../components";

// TODO search navigation for tree viewer
export function useRenderedText(
  text: string,
  search: Nullable<Search>,
): ReactNode {
  const { linkifyUrls } = useContext(SettingsContext);

  const matches = useMemo(
    () => findMatches(text, search, linkifyUrls),
    [text, search, linkifyUrls],
  );

  return <RenderedText text={text} matches={matches} />;
}
