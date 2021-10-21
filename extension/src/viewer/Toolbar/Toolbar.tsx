import { Icon, IconButton } from "viewer/components";
import { dispatch, EventType } from "../commons/EventBus";
import { SearchBox, SearchBoxProps } from "./SearchBox";

export type ToolbarProps = {
  searchBox: SearchBoxProps;
};

export function Toolbar({ searchBox }: ToolbarProps): JSX.Element {
  return (
    <div className="flex bg-gray-100">
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
        search={searchBox.search}
        setSearch={searchBox.setSearch}
      />
    </div>
  );
}

function expand() {
  dispatch(EventType.Expand);
}

function collapse() {
  dispatch(EventType.Collapse);
}
