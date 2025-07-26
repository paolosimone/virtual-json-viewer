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

  const buttonClassName =
    "h-full w-6 fill-input-foreground hover:bg-input-focus";

  return (
    <span className={classNames("flex items-center gap-0.5", className)}>
      <span className="text-input-foreground/75 mr-1 text-nowrap select-none">
        {(currentIndex ?? -1) + 1}/{totalCount}
      </span>

      <IconButton
        className={buttonClassName}
        title={t.toolbar.search.navigation.previous}
        icon={Icon.ChevronUp}
        onClick={() => dispatch(EventType.SearchNavigatePrevious)}
      />

      <IconButton
        className={buttonClassName}
        title={t.toolbar.search.navigation.next}
        icon={Icon.ChevronDown}
        onClick={() => dispatch(EventType.SearchNavigateNext)}
      />
    </span>
  );
}

// TODO keyboard shortcuts
