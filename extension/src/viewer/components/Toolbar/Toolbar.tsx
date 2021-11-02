import classNames from "classnames";
import { useContext } from "react";
import { Icon, IconButton } from "viewer/components";
import { StateObject } from "viewer/hooks";
import { TranslationContext } from "viewer/localization";
import { JQCommand, Search, ViewerMode } from "viewer/state";
import { dispatch, EventType } from "../../commons/EventBus";
import { JQCommandBox } from "./JQCommandBox";
import { SaveButton } from "./SaveButton";
import { SearchBox } from "./SearchBox";
import { ViewerModeToggle } from "./ViewerModeToggle";

export type ToolbarProps = Props<{
  viewerModeState: StateObject<ViewerMode>;
  searchState: StateObject<Search>;
  jqCommandState: StateObject<JQCommand>;
  json: Json;
}>;

export function Toolbar({
  viewerModeState,
  searchState,
  jqCommandState,
  json,
  className,
}: ToolbarProps): JSX.Element {
  const t = useContext(TranslationContext);
  const isTreeView = viewerModeState.value === ViewerMode.Tree;

  return (
    <div
      className={classNames(
        "flex flex-col py-1 px-0.5 bg-gray-100 dark:bg-gray-800",
        className
      )}
    >
      <div className="flex items-center mb-0.5">
        <ViewerModeToggle
          className="w-14 h-7 ml-1"
          viewerMode={viewerModeState.value}
          setViewerMode={viewerModeState.setValue}
        />

        <Separator />

        <IconButton
          className="w-7 h-7 px-px"
          title={t.toolbar.expand}
          icon={Icon.ExpandAll}
          onClick={expand}
        />

        <IconButton
          className="w-7 h-7 px-px"
          title={t.toolbar.collapse}
          icon={Icon.CollapseAll}
          onClick={collapse}
        />

        <Separator />

        <SaveButton className="w-6 h-6 px-px" json={json} />

        <SearchBox
          className="flex-1 ml-2"
          search={searchState.value}
          setSearch={searchState.setValue}
          disableShowMismatch={!isTreeView}
        />
      </div>

      <div>
        <JQCommandBox
          command={jqCommandState.value}
          setCommand={jqCommandState.setValue}
        />
      </div>
    </div>
  );
}

function expand() {
  dispatch(EventType.Expand);
}

function collapse() {
  dispatch(EventType.Collapse);
}

function Separator(): JSX.Element {
  return (
    <div className="border-l border-gray-600 dark:border-gray-400 border-opacity-40 h-3/4 mx-2" />
  );
}
