import classNames from "classnames";
import { JQCommand, Search, ViewerMode } from "viewer/commons/state";
import { Icon, IconButton } from "viewer/components";
import { StateObject } from "viewer/hooks";
import { dispatch, EventType } from "../../commons/EventBus";
import { JQCommandBox } from "./JQCommandBox";
import { SearchBox } from "./SearchBox";
import { ViewerModeToggle } from "./ViewerModeToggle";

export type ToolbarProps = Props<{
  viewerModeState: StateObject<ViewerMode>;
  searchState: StateObject<Search>;
  jqCommandState: StateObject<JQCommand>;
}>;

export function Toolbar({
  viewerModeState,
  searchState,
  jqCommandState,
  className,
}: ToolbarProps): JSX.Element {
  return (
    <div className={classNames("flex flex-col bg-gray-100", className)}>
      <div className="flex items-center mb-0.5">
        <ViewerModeToggle
          className="w-14 h-7 ml-1"
          viewerMode={viewerModeState.value}
          setViewerMode={viewerModeState.setValue}
        />

        <Separator />

        <IconButton
          className="w-7 h-7 px-px"
          title="Expand"
          icon={Icon.ExpandAll}
          onClick={expand}
        />

        <IconButton
          className="w-7 h-7 px-px"
          title="Collapse"
          icon={Icon.CollapseAll}
          onClick={collapse}
        />

        <Separator />

        <SearchBox
          className="flex-1 ml-1 pr-1"
          search={searchState.value}
          setSearch={searchState.setValue}
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
    <div className="border-l-2 border-gray-600 border-opacity-40 h-3/4 mx-2" />
  );
}
