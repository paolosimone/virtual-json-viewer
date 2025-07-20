import { Icon, IconButton, IconLabel } from "@/viewer/components";
import { TranslationContext } from "@/viewer/localization";
import classNames from "classnames";
import { JSX, useContext } from "react";

export type SearchClearButtonProps = Props<{
  isEmpty: boolean;
  clearSearch: () => void;
}>;

export function SearchClearButton({
  className,
  isEmpty,
  clearSearch,
}: SearchClearButtonProps): JSX.Element {
  const t = useContext(TranslationContext);

  if (isEmpty) {
    return (
      <IconLabel
        className={classNames("fill-input-foreground", className)}
        icon={Icon.Search}
      />
    );
  }

  return (
    <IconButton
      className={classNames(
        "fill-input-foreground hover:bg-input-focus",
        className,
      )}
      title={t.toolbar.search.clear}
      icon={Icon.Close}
      onClick={clearSearch}
    />
  );
}
