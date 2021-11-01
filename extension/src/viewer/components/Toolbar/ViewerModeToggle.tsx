import classNames from "classnames";
import { Dispatch, SetStateAction, useCallback } from "react";
import { ViewerMode } from "viewer/commons/state";
import { Icon, IconButton } from "viewer/components";

export type ViewerModeToggleProps = Props<{
  viewerMode: ViewerMode;
  setViewerMode: Dispatch<SetStateAction<ViewerMode>>;
}>;

export function ViewerModeToggle({
  viewerMode,
  setViewerMode,
  className,
}: ViewerModeToggleProps): JSX.Element {
  const toggleView = useCallback(
    () =>
      setViewerMode((viewerMode) =>
        viewerMode === ViewerMode.Tree ? ViewerMode.Raw : ViewerMode.Tree
      ),
    [setViewerMode]
  );

  return (
    <span
      className={classNames(
        "flex items-center rounded-sm ring-1 ring-gray-300 dark:ring-gray-400",
        className
      )}
    >
      <IconButton
        icon={Icon.ListTree}
        onClick={toggleView}
        title="Tree"
        isActive={viewerMode === ViewerMode.Tree}
        disabled={viewerMode === ViewerMode.Tree}
        className="w-1/2 p-0.5"
      />

      <IconButton
        icon={Icon.Json}
        onClick={toggleView}
        title="Raw"
        isActive={viewerMode === ViewerMode.Raw}
        disabled={viewerMode === ViewerMode.Raw}
        className="w-1/2 p-0.5"
      />
    </span>
  );
}
