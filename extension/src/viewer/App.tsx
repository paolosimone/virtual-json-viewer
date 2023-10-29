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

export type AppProps = {
  jsonText: string;
};

type ViewerProps = {
  json: Json.Root;
  search: Search;
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
    () => Json.tryParse(jsonText, { sortKeys: settings.sortKeys }),
    [jsonText, settings.sortKeys],
  );
  const [jqEnabled, jqResult] = useJQ(jsonText, state.jqCommand.value);
  const [json, error] = resolveJson(jsonResult, jqResult);

  // defer the actual rendering in order to show loading placeholder
  // Note: viewerMode dependency is important to trigger transition between modes!
  const targetViewerProps = useMemo(
    () => ({
      json: json,
      search: state.search.value,
    }),
    [state.viewerMode.value, json, state.search.value],
  );

  const [nextViewerProps, setNextViewerProps] =
    useState<Nullable<ViewerProps>>(null);
  const viewerProps = useDeferredValue<Nullable<ViewerProps>>(nextViewerProps);
  const isTransition = viewerProps !== targetViewerProps;

  useEffect(() => {
    const updateTask = setTimeout(
      () => setNextViewerProps(targetViewerProps),
      1,
    );
    return () => clearTimeout(updateTask);
  }, [setNextViewerProps, targetViewerProps]);

  // disable "select all" shortcut
  const handleNavigation = useCallback((e: KeydownEvent) => {
    if (e[CHORD_KEY] && e.key === "a") {
      e.preventDefault();
    }
  }, []);
  useGlobalKeydownEvent(handleNavigation);

  // -- no hooks below -- //

  // fatal error page
  if (jsonResult instanceof Error) {
    return (
      <div className="flex flex-col h-full font-mono">
        <Alert>{jsonResult.message}</Alert>
        <div className="p-3 whitespace-pre">{jsonText}</div>
      </div>
    );
  }

  const toolbarProps = {
    json: json,
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

        {isTransition ? (
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

function resolveJson(
  jsonResult: Result<Json.Root>,
  jqResult: JQResult,
): [Json.Root, Nullable<Error>] {
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

type JQErrorTitleProps = Props<{
  error: Error;
}>;

function JqErrorTitle({ error }: JQErrorTitleProps): JSX.Element {
  const t = useContext(TranslationContext);

  if (error instanceof SyntaxError) {
    return (
      <div className={"font-bold"}>
        {t.toolbar.jq.syntaxError}{" "}
        <a
          className={"underline text-blue-800"}
          href="https://github.com/paolosimone/virtual-json-viewer#why-this-valid-jq-command-doesnt-work"
          target="_blank"
          rel="noreferrer"
        >
          [?]
        </a>
      </div>
    );
  }

  return <div className={"font-bold"}>{t.toolbar.jq.genericError}</div>;
}
