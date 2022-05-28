import { ReactNode, useMemo } from "react";
import { RenderedText } from "viewer/components";
import { Search } from "viewer/state";

export function useRenderedText(
  text: Nullable<string>,
  search: Nullable<Search>
): ReactNode {
  return useMemo(() => {
    if (!text) {
      return text;
    }

    return RenderedText({
      text: text,
      search: search,
    });
  }, [text, search]);
}
