import React from "react";
import { SearchBox } from "./SearchBox";

export type ToolbarProps = {
  onSearch: (text: string) => void;
};

export function Toolbar({ onSearch }: ToolbarProps): JSX.Element {
  // TODO style
  return (
    <div className="mb-2">
      <button onClick={() => document.dispatchEvent(new Event("expand"))}>
        Expand
      </button>
      <button onClick={() => document.dispatchEvent(new Event("collapse"))}>
        Collapse
      </button>
      <SearchBox onSearch={onSearch} />
    </div>
  );
}
