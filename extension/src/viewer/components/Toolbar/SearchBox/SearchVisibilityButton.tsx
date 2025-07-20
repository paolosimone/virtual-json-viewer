import { Icon, IconButton } from "@/viewer/components";
import { TranslationContext } from "@/viewer/localization";
import { SearchVisibility } from "@/viewer/state";
import classNames from "classnames";
import { Dispatch, JSX, useContext } from "react";

export type SearchVisibilityToggleProps = Props<{
  visibility: SearchVisibility;
  setVisibility: Dispatch<SearchVisibility>;
}>;

export function SearchVisibilityToggle({
  className,
  visibility,
  setVisibility,
}: SearchVisibilityToggleProps): JSX.Element {
  const t = useContext(TranslationContext);

  return (
    <IconButton
      className={classNames(
        "fill-input-foreground hover:bg-input-focus",
        className,
      )}
      title={t.toolbar.search.visibility[visibility]}
      icon={SEARCH_MISMATCH_ICONS[visibility]}
      onClick={() => setVisibility(nextSearchMismatch(visibility))}
    />
  );
}

const SEARCH_MISMATCH_ICONS: Record<SearchVisibility, Icon.Icon> = {
  [SearchVisibility.All]: Icon.Eye,
  [SearchVisibility.Subtree]: Icon.EyeClosed,
  [SearchVisibility.Match]: Icon.EyeClosedCross,
};

function nextSearchMismatch(current: SearchVisibility): SearchVisibility {
  const values = Object.values(SearchVisibility);
  return values[(values.indexOf(current) + 1) % values.length];
}
