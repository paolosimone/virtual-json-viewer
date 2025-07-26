import { dispatch, EventType } from "@/viewer/commons/EventBus";
import { Icon, IconButton } from "@/viewer/components";
import { TranslationContext } from "@/viewer/localization";
import classNames from "classnames";
import { JSX, useContext } from "react";

export type SearchNavigationPanelProps = Props<{
  currentIndex: Nullable<number>;
  totalCount: number;
}>;

export function SearchNavigationPanel({
  className,
  currentIndex,
  totalCount,
}: SearchNavigationPanelProps): JSX.Element {
  const t = useContext(TranslationContext);

  const displayIndex = (currentIndex ?? -1) + 1;

  const buttonDisabled = totalCount === 0;
  const buttonClassName =
    "h-full w-6 disabled:fill-input-foreground/50 enabled:fill-input-foreground enabled:hover:bg-input-focus";

  return (
    <span className={classNames("flex items-center gap-0.5", className)}>
      <span className="text-input-foreground/75 mr-1 text-nowrap select-none">
        {displayIndex}/{totalCount}
      </span>

      <IconButton
        className={buttonClassName}
        title={t.toolbar.search.navigation.previous}
        disabled={buttonDisabled}
        icon={Icon.ChevronUp}
        onClick={() => dispatch(EventType.SearchNavigatePrevious)}
      />

      <IconButton
        className={buttonClassName}
        title={t.toolbar.search.navigation.next}
        disabled={buttonDisabled}
        icon={Icon.ChevronDown}
        onClick={() => dispatch(EventType.SearchNavigateNext)}
      />
    </span>
  );
}

// TODO keyboard shortcuts
