import classNames from "classnames";
import { useMemo } from "react";
import * as Json from "viewer/commons/Json";
import "../global.css";
import { Alert, RawViewer, Toolbar, TreeViewer } from "./components";
import { MultiContextProvider } from "./components/MultiContextProvider";
import {
  JQResult,
  useJQ,
  useSessionStorage,
  useSettings,
  useStateObjectAdapter,
  useTheme,
} from "./hooks";
import { TranslationContext, useLocalization } from "./localization";
import {
  EmptyJQCommand,
  EmptySearch,
  resolveTextSizeClass,
  SettingsContext,
  ViewerMode,
} from "./state";

export type AppProps = {
  jsonText: string;
};

export function App({ jsonText }: AppProps): JSX.Element {
  // global settings
  const [_colors] = useTheme();
  const [translation] = useLocalization();
  const [settings] = useSettings();

  // application state
  const viewerModeState = useStateObjectAdapter(
    useSessionStorage("viewer", ViewerMode.Tree)
  );
  const searchState = useStateObjectAdapter(
    useSessionStorage("search", EmptySearch)
  );
  const jqCommandState = useStateObjectAdapter(
    useSessionStorage("jq", EmptyJQCommand)
  );

  // parse json
  const jsonResult = useMemo(() => Json.tryParse(jsonText), [jsonText]);
  const [jqEnabled, jqResult] = useJQ(jsonText, jqCommandState.value);

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

  // heuristic to detect large json and enabled placeholder on loading
  const isLargeJson = useMemo(
    () => Json.toString(json).length > 1_000_000,
    [json]
  );

  return (
    <MultiContextProvider
      contexts={[
        [TranslationContext, translation],
        [SettingsContext, settings],
      ]}
    >
      <div className="flex flex-col h-full min-w-[500px] min-h-[500px] overflow-hidden font-mono">
        <Toolbar {...toolbarProps} />

        {error && <Alert message={error.message} />}

        <Viewer
          json={json}
          search={searchState.value}
          enablePlaceholder={isLargeJson}
          className={classNames(
            "flex-auto pt-1.5 pl-1.5 bg-viewer-background text-viewer-foreground selection:bg-amber-200 selection:text-black",
            resolveTextSizeClass(settings.textSize)
          )}
        />
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
