import { ReactNode, useContext, useEffect, useMemo } from "react";
import { RenderedText } from "viewer/components";
import { Search, SettingsContext } from "viewer/state";

// heuristic: https://media.tenor.com/6PFS7ABeJGEAAAAC/dr-evil-one-billion-dollars.gif
const LARGE_TEXT_LENGTH = 1_000_000;

export function useRenderedText(
  text: string,
  search: Nullable<Search>,
): ReactNode {
  const { linkifyUrls: linkifySettings } = useContext(SettingsContext);

  // linkifyUrls is disabled for large text to improve performance
  const isLargeText = text.length > LARGE_TEXT_LENGTH;
  const linkifyUrls = linkifySettings && !isLargeText;

  useEffect(() => {
    if (linkifySettings && !linkifyUrls) {
      console.info(
        "Large text detected: Linkify URL has been disable to improve performance",
      );
    }
  }, [isLargeText, linkifySettings]);

  return useMemo(
    () =>
      RenderedText({
        text: text,
        search: search,
        linkifyUrls: linkifyUrls,
      }),
    [text, search, linkifyUrls],
  );
}
