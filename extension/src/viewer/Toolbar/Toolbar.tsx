import { dispatch, EventType } from "../commons/EventBus";
import { SearchBox, SearchBoxProps } from "./SearchBox";

export type ToolbarProps = SearchBoxProps;

export function Toolbar({ search, setSearch }: ToolbarProps): JSX.Element {
  return (
    <div className="mb-2">
      <button onClick={expand}>Expand</button>
      <button onClick={collapse}>Collapse</button>
      <SearchBox search={search} setSearch={setSearch} />
    </div>
  );
}

function expand() {
  dispatch(EventType.Expand);
}

function collapse() {
  dispatch(EventType.Collapse);
}
