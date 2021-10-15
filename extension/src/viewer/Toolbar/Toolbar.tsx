import { dispatch, EventType } from "../commons/EventBus";
import { SearchBox, SearchBoxProps } from "./SearchBox";

export type ToolbarProps = SearchBoxProps;

export function Toolbar({ setSearch }: ToolbarProps): JSX.Element {
  // TODO style
  return (
    <div className="mb-2">
      <button onClick={expand}>Expand</button>
      <button onClick={collapse}>Collapse</button>
      <SearchBox setSearch={setSearch} />
    </div>
  );
}

function expand() {
  dispatch(EventType.Expand);
}

function collapse() {
  dispatch(EventType.Collapse);
}
