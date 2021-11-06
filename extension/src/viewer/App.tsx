import classNames from "classnames";
import { useMemo } from "react";
import "tailwindcss/tailwind.css";
import * as Json from "viewer/commons/Json";
import { Alert, RawViewer, Toolbar, TreeViewer } from "./components";
import { MultiContextProvider } from "./components/MultiContextProvider";
import {
  JQResult,
  useJQ,
  useSettings,
  useStateObject,
  useTheme,
} from "./hooks";
import { TranslationContext, useLocalization } from "./localization";
import {
  EmptyJQCommand,
  EmptySearch,
  resolveTextSizeClass,
  SettingsContext,
  ThemeContext,
  ViewerMode,
} from "./state";

export type AppProps = {
  jsonText: string;
  jqWasmFile: string;
};

export function App({ jsonText, jqWasmFile }: AppProps): JSX.Element {
  // global settings
  const [theme] = useTheme();
  const [translation] = useLocalization();
  const [settings] = useSettings();

  // application state
  const viewerModeState = useStateObject(ViewerMode.Tree);
  const searchState = useStateObject(EmptySearch);
  const jqCommandState = useStateObject(EmptyJQCommand);

  // parse json
  const jsonResult = useMemo(() => Json.tryParse(jsonText), [jsonText]);
  const [jqEnabled, jqResult] = useJQ(
    jqWasmFile,
    jsonText,
    jqCommandState.value
  );

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

  const toolbarProps = {
    json: json,
    viewerModeState: viewerModeState,
    searchState: searchState,
    jqCommandState: jqEnabled ? jqCommandState : undefined,
  };

  const Viewer =
    viewerModeState.value === ViewerMode.Tree ? TreeViewer : RawViewer;

  return (
    <MultiContextProvider
      contexts={[
        [ThemeContext, theme],
        [TranslationContext, translation],
        [SettingsContext, settings],
      ]}
    >
      <div className="flex flex-col h-full overflow-hidden font-mono">
        <Toolbar {...toolbarProps} />

        {error && <Alert message={error.message} />}

        <div
          className={classNames(
            "flex-1 pt-1.5 pl-1.5 overflow-auto dark:bg-gray-700 dark:text-gray-200",
            resolveTextSizeClass(settings.textSize)
          )}
        >
          <Viewer json={json} search={searchState.value} />
        </div>
      </div>
    </MultiContextProvider>
  );
}

function resolveJson(
  jsonResult: Json.Root,
  jqResult: JQResult
): [Json.Root, Nullable<Error>] {
  if (jqResult === undefined) {
    return [jsonResult, null];
  }

  if (jqResult instanceof Error) {
    return [jsonResult, jqResult];
  }

  return [jqResult, null];
}
