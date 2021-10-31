import { useMemo } from "react";
import "tailwindcss/tailwind.css";
import { EmptyJQCommand, EmptySearch, ViewerMode } from "./commons/state";
import { Alert, RawViewer, Toolbar, TreeViewer } from "./components";
import { useJQ, useStateObject } from "./hooks";

export type AppProps = {
  jsonText: string;
  jqWasmFile: string;
};

export function App({ jsonText, jqWasmFile }: AppProps): JSX.Element {
  const viewerModeState = useStateObject(ViewerMode.Tree);
  const searchState = useStateObject(EmptySearch);
  const jqCommandState = useStateObject(EmptyJQCommand);

  const jqResult = useJQ(jqWasmFile, jsonText, jqCommandState.value);
  const [json, error] = useParseOutcome(jsonText, jqResult);

  if (json === undefined) {
    return (
      <div className="flex flex-col h-full font-mono">
        <Alert message={error?.message ?? "Something went wrong"} />
        <div className="p-3 whitespace-pre">{jsonText}</div>
      </div>
    );
  }

  // TODO setting text size

  const toolbarProps = {
    viewerModeState: viewerModeState,
    searchState: searchState,
    jqCommandState: jqCommandState,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-mono">
      <Toolbar {...toolbarProps} />

      {error && <Alert message={error.message} />}

      <div className="flex-1 mt-1.5 ml-1.5 overflow-auto text-sm">
        {viewerModeState.value === ViewerMode.Tree && (
          <TreeViewer json={json} search={searchState.value} />
        )}

        {viewerModeState.value === ViewerMode.Raw && (
          <RawViewer json={json} search={searchState.value} />
        )}
      </div>
    </div>
  );
}

type ParseOutcome = [Json | undefined, Error | undefined];

// TODO refactor
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
    return [undefined, jsonResult];
  }

  if (jqJsonResult instanceof Error) {
    return [jsonResult, jqJsonResult];
  }

  return [jqJsonResult, undefined];
}

function tryParse(jsonText: string): Result<Json> {
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    return e as Error;
  }
}
