import { useMemo } from "react";
import "tailwindcss/tailwind.css";
import { EmptyJQCommand } from "./commons/JQCommand";
import { EmptySearch } from "./commons/Search";
import { useJQ, useStateObject } from "./hooks";
import { Toolbar } from "./Toolbar";
import { TreeViewer } from "./TreeViewer";

export type AppProps = {
  jsonText: string;
  jqWasmFile: string;
};

// TODO refactor toolbar & treeviewer -> components

export function App({ jsonText, jqWasmFile }: AppProps): JSX.Element {
  const searchState = useStateObject(EmptySearch);
  const jqCommandState = useStateObject(EmptyJQCommand);

  const jqResult = useJQ(jqWasmFile, jsonText, jqCommandState.value);
  const [json, error] = useParseOutcome(jsonText, jqResult);

  const toolbarProps = {
    searchState: searchState,
    jqCommandState: jqCommandState,
  };

  // TODO setting text size

  if (!json) {
    return (
      <div className="flex flex-col h-full font-mono">
        {error && <div>{error.message}</div>}
        <div className="whitespace-pre">{jsonText}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-mono">
      <Toolbar {...toolbarProps} />
      {error && <div>{error.message}</div>}
      <div className="flex-1 mt-1.5 pl-1.5 text-sm">
        <TreeViewer json={json} search={searchState.value} />
      </div>
    </div>
  );
}

type ParseOutcome = [Nullable<Json>, Nullable<Error>];

function useParseOutcome(
  jsonText: string,
  jqResult: Result<string>
): ParseOutcome {
  const jsonResult = useMemo(() => tryParse(jsonText), [jsonText]);

  const jqJsonResult = useMemo(() => {
    if (jsonResult instanceof Error || jqResult === jsonText) {
      return jsonResult;
    }

    if (jqResult instanceof Error) {
      return jqResult;
    }

    return tryParse(jqResult);
  }, [jqResult, jsonText, jsonResult]);

  if (jsonResult instanceof Error) {
    return [null, jsonResult];
  }

  if (jqJsonResult instanceof Error) {
    return [jsonResult, jqJsonResult];
  }

  return [jqJsonResult, null];
}

function tryParse(jsonText: string): Result<Json> {
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    return e as Error;
  }
}
