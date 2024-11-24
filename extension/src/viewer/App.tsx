import classNames from "classnames";
import {
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Json from "viewer/commons/Json";
import "../global.css";
import {
  Alert,
  RawViewer,
  Toolbar,
  TreeViewer,
  ViewerPlaceholder,
} from "./components";
import { MultiContextProvider } from "./components/MultiContextProvider";
import {
  CHORD_KEY,
  JQResult,
  KeydownEvent,
  StateObject,
  useGlobalKeydownEvent,
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
  JQCommand,
  Search,
  Settings,
  SettingsContext,
  ViewerMode,
  resolveTextSizeClass,
} from "./state";

// heuristic: https://media.tenor.com/6PFS7ABeJGEAAAAC/dr-evil-one-billion-dollars.gif
const LARGE_JSON_LENGTH = 1_000_000;

export type AppProps = {
  jsonText: string;
};

type ViewerProps = {
  jsonLines: Json.Lines;
  search: Search;
  isLargeJson: boolean;
};

export function App({ jsonText }: AppProps): JSX.Element {
  // global settings
  const [_colors] = useTheme();
  const [translation] = useLocalization();
  const [settings] = useSettings();

  // application state
  const state = useApplicationState(settings);

  // parse json
  const jsonResult = useMemo(
    () => Json.tryParseLines(jsonText, { sortKeys: settings.sortKeys }),
    [jsonText, settings.sortKeys],
  );
  const [jqEnabled, jqResult] = useJQ(jsonText, state.jqCommand.value);
  const [jsonLines, error] = resolveJson(jsonResult, jqResult);

  const viewerProps = useTransitionViewerProps(state, jsonText, jsonLines);

  // disable "select all" shortcut
  const handleNavigation = useCallback((e: KeydownEvent) => {
    if (e[CHORD_KEY] && e.key === "a") {
      e.preventDefault();
    }
  }, []);
  useGlobalKeydownEvent(handleNavigation);

  // -- no hooks below -- //

  // fatal error page
  if (jsonLines === null) {
    return (
      <div className="flex flex-col h-full font-mono">
        <Alert>{error?.message}</Alert>
        <div className="p-3 whitespace-pre">{jsonText}</div>
      </div>
    );
  }

  const toolbarProps = {
    jsonLines,
    viewerModeState: state.viewerMode,
    searchState: state.search,
    jqCommandState: jqEnabled ? state.jqCommand : undefined,
  };

  const Viewer =
    state.viewerMode.value === ViewerMode.Tree ? TreeViewer : RawViewer;

  return (
    <MultiContextProvider
      contexts={[
        [TranslationContext, translation],
        [SettingsContext, settings],
      ]}
    >
      <div className="flex flex-col h-full min-w-[500px] min-h-[500px] overflow-hidden font-mono bg-viewer-background">
        <Toolbar {...toolbarProps} />

        {error && (
          <Alert>
            <JqErrorTitle error={error} />
            {error.message}
          </Alert>
        )}

        {viewerProps === null ? (
          <ViewerPlaceholder className="flex-auto" />
        ) : (
          <Viewer
            {...viewerProps}
            className={classNames(
              "flex-auto pt-1.5 pl-1.5 text-viewer-foreground selection:bg-amber-200 selection:text-black",
              resolveTextSizeClass(settings.textSize),
            )}
          />
        )}
      </div>
    </MultiContextProvider>
  );
}

type ApplicationState = {
  viewerMode: StateObject<ViewerMode>;
  search: StateObject<Search>;
  jqCommand: StateObject<JQCommand>;
};

// Application state is stored in session and kept on page reload.
// Default state is customizable in settings but not available on first render,
// so we need to subscribe to update the state when settings are loaded,
// unless of course the state was already loaded from an existing session.
function useApplicationState(settings: Settings): ApplicationState {
  const [viewer, setViewer, viewerWasInSession] = useSessionStorage(
    "viewer",
    settings.viewerMode,
  );
  if (!viewerWasInSession) {
    useEffect(() => setViewer(settings.viewerMode), [settings]);
  }

  const [search, setSearch, searchWasInSession] = useSessionStorage(
    "search",
    EmptySearch,
  );
  if (!searchWasInSession) {
    useEffect(
      () =>
        setSearch((search) => ({
          ...search,
          visibility: settings.searchVisibility,
        })),
      [settings],
    );
  }

  const [jq, setJQ] = useSessionStorage("jq", EmptyJQCommand);

  return {
    viewerMode: useStateObjectAdapter([viewer, setViewer]),
    search: useStateObjectAdapter([search, setSearch]),
    jqCommand: useStateObjectAdapter([jq, setJQ]),
  };
}

// Defer state transition in case of large JSON in order to show loading placeholder
function useTransitionViewerProps(
  state: ApplicationState,
  jsonText: string,
  jsonLines: Nullable<Json.Lines>,
): Nullable<ViewerProps> {
  const [nextProps, setNextProps] = useState<Nullable<ViewerProps>>(null);
  const props = useDeferredValue<Nullable<ViewerProps>>(nextProps);

  const isLargeJson = jsonText.length > LARGE_JSON_LENGTH;

  // Note: viewerMode dependency is important to trigger transition between modes!
  const targetProps = useMemo(() => {
    if (jsonLines === null) {
      // nothing to show
      return null;
    }

    return {
      jsonLines,
      search: state.search.value,
      isLargeJson,
    };
  }, [state.viewerMode.value, jsonLines, isLargeJson, state.search.value]);

  useEffect(() => {
    const updateTask = setTimeout(() => setNextProps(targetProps), 1);
    return () => clearTimeout(updateTask);
  }, [setNextProps, targetProps]);

  const isTransition = props !== targetProps;
  const deferredProps = isTransition ? null : props;
  return isLargeJson ? deferredProps : targetProps;
}

function resolveJson(
  jsonResult: Result<Json.Lines>,
  jqResult: JQResult,
): [Nullable<Json.Lines>, Nullable<Error>] {
  if (jsonResult instanceof Error) {
    return [null, jsonResult];
  }

  if (jqResult === undefined) {
    return [jsonResult, null];
  }

  if (jqResult instanceof Error) {
    return [jsonResult, jqResult];
  }

  return [jqResult, null];
}

type JqErrorTitleProps = Props<{
  error: Error;
}>;

function JqErrorTitle(_props: JqErrorTitleProps): JSX.Element {
  const t = useContext(TranslationContext);
  return <div className={"font-bold"}>{t.toolbar.jq.genericError}</div>;
}
