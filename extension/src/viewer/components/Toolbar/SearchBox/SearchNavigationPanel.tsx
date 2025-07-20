import { Icon, IconButton } from "@/viewer/components";
import { TranslationContext } from "@/viewer/localization";
import classNames from "classnames";
import { Dispatch, JSX, useContext } from "react";

export type SearchNavigationPanelProps = Props<{
  currentIndex: Nullable<number>;
  totalCount: number;
  setCurrentIndex: Dispatch<Nullable<number>>;
}>;

export function SearchNavigationPanel({
  className,
  currentIndex,
  totalCount,
  setCurrentIndex,
}: SearchNavigationPanelProps): JSX.Element {
  const t = useContext(TranslationContext);

  const index = currentIndex ?? -1;
  const canDecrement = index > 0;
  const canIncrement = index < totalCount - 1;

  const buttonClassName =
    "h-full w-6 disabled:fill-input-foreground/50 enabled:fill-input-foreground enabled:hover:bg-input-focus";

  return (
    <span className={classNames("flex items-center gap-0.5", className)}>
      <span className="text-input-foreground/75 mr-1 text-nowrap select-none">
        {index + 1}/{totalCount}
      </span>

      <IconButton
        className={buttonClassName}
        title={t.toolbar.search.navigation.previous}
        disabled={!canDecrement}
        icon={Icon.ChevronUp}
        onClick={() => setCurrentIndex(index - 1)}
      />

      <IconButton
        className={buttonClassName}
        title={t.toolbar.search.navigation.next}
        disabled={!canIncrement}
        icon={Icon.ChevronDown}
        onClick={() => setCurrentIndex(index + 1)}
      />
    </span>
  );
}

// TODO keyboard shortcuts
