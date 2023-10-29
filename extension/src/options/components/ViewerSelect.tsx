import { Dispatch, useContext } from "react";
import { Select } from "viewer/components";
import { TranslationContext } from "viewer/localization";
import { ViewerMode } from "viewer/state";

export type ViewerSelectProps = Props<{
  viewerMode: ViewerMode;
  setViewerMode: Dispatch<ViewerMode>;
}>;

export function ViewerSelect({
  viewerMode,
  setViewerMode,
  className,
}: ViewerSelectProps): JSX.Element {
  const t = useContext(TranslationContext);

  const options = Object.values(ViewerMode).map((viewerMode) => ({
    value: viewerMode,
    label: t.toolbar.view[viewerMode],
  }));

  return (
    <Select
      options={options}
      selected={viewerMode}
      setValue={setViewerMode}
      className={className}
    />
  );
}
