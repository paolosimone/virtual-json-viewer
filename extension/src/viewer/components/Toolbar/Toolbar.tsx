import { JQCommand } from "viewer/commons/JQCommand";
import { Search } from "viewer/commons/Search";
import { Icon, IconButton } from "viewer/components";
import { StateObject } from "viewer/hooks";
import { dispatch, EventType } from "../../commons/EventBus";
import { JQCommandBox } from "./JQCommandBox";
import { SearchBox } from "./SearchBox";

export type ToolbarProps = {
  searchState: StateObject<Search>;
  jqCommandState: StateObject<JQCommand>;
};

export function Toolbar({
  searchState,
  jqCommandState,
}: ToolbarProps): JSX.Element {
  return (
    <div className="flex flex-col bg-gray-100">
      <div className="flex mb-0.5">
        <IconButton
          className="w-7 h-7 px-0.5 ml-1 mr-0.5"
          title="Expand"
          icon={Icon.ExpandAll}
          onClick={expand}
        />

        <IconButton
          className="w-7 h-7 px-0.5 ml-0.5 mr-0.5"
          title="Collapse"
          icon={Icon.CollapseAll}
          onClick={collapse}
        />

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
