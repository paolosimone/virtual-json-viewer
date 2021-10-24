import { useMemo } from "react";
import "tailwindcss/tailwind.css";
import { EmptyJQFilter } from "./commons/JQFilter";
import { EmptySearch } from "./commons/Search";
import { useJQFilter, useStateObject } from "./hooks";
import { Toolbar } from "./Toolbar";
import { TreeViewer } from "./TreeViewer";

export type AppProps = {
  jsonText: string;
  jqWasmFile: string;
};

export function App({ jsonText, jqWasmFile }: AppProps): JSX.Element {
  const jqFilterState = useStateObject(EmptyJQFilter);
  const searchState = useStateObject(EmptySearch);
  const toolbarProps = {
    searchState: searchState,
    jqFilterState: jqFilterState,
  };

  const showJsonText = useJQFilter(
    jqWasmFile,
    jsonText,
    jqFilterState.state.expression
  );

  const json = useMemo(() => JSON.parse(showJsonText), [showJsonText]);

  return (
    <div className="flex flex-col h-full font-mono">
      <Toolbar {...toolbarProps} />
      <div className="flex-1 mt-1.5 pl-1.5">
        <TreeViewer json={json} search={searchState.state} />
      </div>
    </div>
  );
}
