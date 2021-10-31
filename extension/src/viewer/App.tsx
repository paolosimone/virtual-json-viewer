import { useMemo } from "react";
import "tailwindcss/tailwind.css";
import { EmptyJQCommand, EmptySearch, ViewerMode } from "./commons/state";
import { Alert, RawViewer, Toolbar, TreeViewer } from "./components";
import { JQResult, useJQ, useStateObject } from "./hooks";

export type AppProps = {
  jsonText: string;
  jqWasmFile: string;
};

export function App({ jsonText, jqWasmFile }: AppProps): JSX.Element {
  const viewerModeState = useStateObject(ViewerMode.Tree);
  const searchState = useStateObject(EmptySearch);
  const jqCommandState = useStateObject(EmptyJQCommand);

  const jsonResult = useMemo(() => tryParse(jsonText), [jsonText]);
  const jqResult = useJQ(jqWasmFile, jsonText, jqCommandState.value);

  if (jsonResult instanceof Error) {
    return (
      <div className="flex flex-col h-full font-mono">
        <Alert message={jsonResult.message} />
        <div className="p-3 whitespace-pre">{jsonText}</div>
      </div>
    );
  }

  const [json, error] = resolveJson(jsonResult, jqResult);

  // TODO setting text size

  const toolbarProps = {
    viewerModeState: viewerModeState,
    searchState: searchState,
    jqCommandState: jqCommandState,
    json: json,
  };

  const Viewer =
    viewerModeState.value === ViewerMode.Tree ? TreeViewer : RawViewer;

  return (
    <div className="flex flex-col h-full overflow-hidden font-mono">
      <Toolbar {...toolbarProps} />

      {error && <Alert message={error.message} />}

      <div className="flex-1 mt-1.5 ml-1.5 overflow-auto text-sm">
        <Viewer json={json} search={searchState.value} />
      </div>
    </div>
  );
}

function resolveJson(
  jsonResult: Json,
  jqResult: JQResult
): [Json, Nullable<Error>] {
  if (jqResult === undefined) {
    return [jsonResult, null];
  }

  if (jqResult instanceof Error) {
    return [jsonResult, jqResult];
  }

  return [jqResult, null];
}

function tryParse(jsonText: string): Result<Json> {
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    return e as Error;
  }
}
