import { Search } from "@/viewer/state";
import { ReactNode } from "react";

export function useRenderedText(
  text: string,
  search: Nullable<Search>,
): ReactNode {
  // const { linkifyUrls } = useContext(SettingsContext);

  // return useMemo(
  //   () => RenderedText({ text, search, linkifyUrls, onSearchMatchesUpdate: () => {} }),
  //   [text, search, linkifyUrls],
  // );
  return "";
}
