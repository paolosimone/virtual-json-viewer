import classNames from "classnames";
import { Dispatch, JSX, SetStateAction, useCallback, useContext } from "react";
import { Icon, IconButton } from "@/viewer/components";
import { CHORD_KEY, KeydownEvent, useGlobalKeydownEvent } from "@/viewer/hooks";
import { TranslationContext } from "@/viewer/localization";
import { ViewerMode } from "@/viewer/state";

export type ViewerModeToggleProps = Props<{
  viewerMode: ViewerMode;
  setViewerMode: Dispatch<SetStateAction<ViewerMode>>;
}>;

export function ViewerModeToggle({
  viewerMode,
  setViewerMode,
  className,
}: ViewerModeToggleProps): JSX.Element {
  const t = useContext(TranslationContext);

  const toggleView = useCallback(
    () =>
      setViewerMode((viewerMode) =>
        viewerMode === ViewerMode.Tree ? ViewerMode.Raw : ViewerMode.Tree,
      ),
    [setViewerMode],
  );

  // register global shortcut
  const handleShortcut = useCallback(
    (e: KeydownEvent) => {
      if (e[CHORD_KEY] && e.key == "i") {
        e.preventDefault();
        toggleView();
      }
    },
    [toggleView],
  );
  useGlobalKeydownEvent(handleShortcut);

  const isTreeView = viewerMode === ViewerMode.Tree;

  return (
    <span className={classNames("flex items-center rounded-sm", className)}>
      <IconButton
        icon={Icon.ListTree}
        onClick={toggleView}
        title={t.toolbar.view.tree}
        disabled={isTreeView}
        className={classNames("w-1/2 p-0.5 fill-toolbar-foreground", {
          "hover:bg-toolbar-focus": !isTreeView,
          "bg-toolbar-focus": isTreeView,
        })}
      />

      <IconButton
        icon={Icon.Json}
        onClick={toggleView}
        title={t.toolbar.view.raw}
        disabled={!isTreeView}
        className={classNames("w-1/2 p-0.5 fill-toolbar-foreground", {
          "hover:bg-toolbar-focus": isTreeView,
          "bg-toolbar-focus": !isTreeView,
        })}
      />
    </span>
  );
}
