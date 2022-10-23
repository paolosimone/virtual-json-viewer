import { ReactNode, useContext, useEffect, useMemo, useState } from "react";
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

export type RenderedTextState = {
  renderedText: Nullable<ReactNode>;
  isLoading: boolean;
};

export function useLazyRenderedText(
  text: string,
  search: Nullable<Search>
): RenderedTextState {
  const { linkifyUrls } = useContext(SettingsContext);
  const [renderedText, setRenderedText] = useState<Nullable<ReactNode>>(null);

  useEffect(() => {
    setRenderedText(null);
    const renderTask = setTimeout(
      () => setRenderedText(RenderedText({ text, search, linkifyUrls })),
      0
    );
    return () => clearTimeout(renderTask);
  }, [text, search, linkifyUrls, setRenderedText]);

  return { renderedText, isLoading: renderedText === null };
}
