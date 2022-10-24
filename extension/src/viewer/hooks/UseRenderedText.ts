import { ReactNode, useContext, useMemo } from "react";
import { RenderedText } from "viewer/components";
import { Search, SettingsContext } from "viewer/state";

export function useRenderedText(
  text: string,
  search: Nullable<Search>
): ReactNode {
  const { linkifyUrls } = useContext(SettingsContext);

  return useMemo(
    () =>
      RenderedText({
        text: text,
        search: search,
        linkifyUrls: linkifyUrls,
      }),
    [text, search, linkifyUrls]
  );
}
