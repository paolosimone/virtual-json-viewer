import { RenderedText } from "@/viewer/components";
import { Search, SettingsContext } from "@/viewer/state";
import { ReactNode, useContext, useMemo } from "react";

export function useRenderedText(
  text: string,
  search: Nullable<Search>,
): ReactNode {
  const { linkifyUrls } = useContext(SettingsContext);

  return useMemo(
    () => RenderedText({ text, search, linkifyUrls }),
    [text, search, linkifyUrls],
  );
}
