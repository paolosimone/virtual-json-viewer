import { useMemo } from "react";
import "tailwindcss/tailwind.css";
import { Alert, RawViewer, Toolbar, TreeViewer } from "./components";
import { MultiContextProvider } from "./components/MultiContextProvider";
import {
  currentTheme,
  JQResult,
  useJQ,
  useStateObject,
  useTheme,
} from "./hooks";
import {
  languageTranslations,
  TranslationContext,
  useLocalization,
} from "./localization";
import { EmptyJQCommand, EmptySearch, ThemeContext, ViewerMode } from "./state";

export type AppProps = {
  jsonText: string;
  jqWasmFile: string;
};

export function App({ jsonText, jqWasmFile }: AppProps): JSX.Element {
  // global settings
  // TODO refactor theme
  const theme = currentTheme(useTheme()[0]);
  const translation = languageTranslations[useLocalization()];

  // application state
  const viewerModeState = useStateObject(ViewerMode.Tree);
  const searchState = useStateObject(EmptySearch);
  const jqCommandState = useStateObject(EmptyJQCommand);

  // parse json
  const jsonResult = useMemo(() => tryParse(jsonText), [jsonText]);
  const jqResult = useJQ(jqWasmFile, jsonText, jqCommandState.value);

  // fatal error page
  if (jsonResult instanceof Error) {
    return (
      <div className="flex flex-col h-full font-mono">
        <Alert message={jsonResult.message} />
        <div className="p-3 whitespace-pre">{jsonText}</div>
      </div>
    );
  }

  // viewer page
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
    <MultiContextProvider
      contexts={[
        [ThemeContext, theme],
        [TranslationContext, translation],
      ]}
    >
      <div className="flex flex-col h-full overflow-hidden font-mono">
        <Toolbar {...toolbarProps} />

        {error && <Alert message={error.message} />}

        <div className="flex-1 pt-1.5 pl-1.5 overflow-auto text-sm dark:bg-gray-700 dark:text-gray-200">
          <Viewer json={json} search={searchState.value} />
        </div>
      </div>
    </MultiContextProvider>
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
