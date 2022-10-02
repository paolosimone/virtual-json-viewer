import classNames from "classnames";
import { Dispatch, SetStateAction, useCallback, useContext } from "react";
import { Icon, IconButton } from "viewer/components";
import { CHORD_KEY, useGlobalKeydownEvent } from "viewer/hooks";
import { TranslationContext } from "viewer/localization";
import { ViewerMode } from "viewer/state";

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
        viewerMode === ViewerMode.Tree ? ViewerMode.Raw : ViewerMode.Tree
      ),
    [setViewerMode]
  );

  // register global shortcut
  const handleShortcut = useCallback(
    (e: KeyboardEvent) => {
      if (e[CHORD_KEY] && e.key == "i") {
        e.preventDefault();
        toggleView();
      }
    },
    [toggleView]
  );
  useGlobalKeydownEvent(handleShortcut);

  return (
    <span className={classNames("flex items-center rounded-sm", className)}>
      <IconButton
        icon={Icon.ListTree}
        onClick={toggleView}
        title={t.toolbar.treeView}
        isActive={viewerMode === ViewerMode.Tree}
        disabled={viewerMode === ViewerMode.Tree}
        className="w-1/2 p-0.5"
      />

      <IconButton
        icon={Icon.Json}
        onClick={toggleView}
        title={t.toolbar.rawView}
        isActive={viewerMode === ViewerMode.Raw}
        disabled={viewerMode === ViewerMode.Raw}
        className="w-1/2 p-0.5"
      />
    </span>
  );
}
