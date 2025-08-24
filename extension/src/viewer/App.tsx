import "@/global.css";
import * as Json from "@/viewer/commons/Json";
import classNames from "classnames";
import {
  JSX,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isActiveElementEditable } from "./commons/Dom";
import {
  Alert,
  RawViewer,
  RawViewerProps,
  Toolbar,
  TreeViewer,
  TreeViewerProps,
  ViewerPlaceholder,
} from "./components";
import { MultiContextProvider } from "./components/MultiContextProvider";
import {
  CHORD_KEY,
  JQResult,
  KeydownEvent,
  StateObject,
  updateField,
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
  EmptySearchNavigation,
  JQCommand,
  Search,
  SearchNavigation,
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

type ViewerProps = TreeViewerProps & RawViewerProps;

export function App({ jsonText }: AppProps): JSX.Element {
  // Global settings
  const [_colors] = useTheme();
  const [translation] = useLocalization();
  const [settings] = useSettings();

  // Parse json
  const jsonResult = useMemo(
    () => Json.tryParseLines(jsonText, { sortKeys: settings.sortKeys }),
    [jsonText, settings.sortKeys],
  );
  const isInputMultiline = isMultipleJsonLines(jsonResult);

  // Application state
  const state = useApplicationState(settings, isInputMultiline);

  // Apply jq filter
  const [jqEnabled, jqResult] = useJQ(jsonText, state.jqCommand.value);
  const [jsonLines, error] = resolveJson(jsonResult, jqResult);

  // Build props for the viewer, with deferred transition for large JSON
  const viewerPropsParams = {
    state,
    jsonLines,
    isLargeJson: jsonText.length > LARGE_JSON_LENGTH,
    enableEnterNode: jqEnabled && error === null,
  };
  const viewerProps = useTransitionViewerProps(viewerPropsParams);

  // Browser default's "select all" behavior is not meaningful in the viewer,
  // children components should handle their own selection (except for standard input elements)
  const disableSelectAll = useCallback((e: KeydownEvent) => {
    if (e[CHORD_KEY] && e.key === "a" && !isActiveElementEditable()) {
      e.preventDefault();
    }
  }, []);
  useGlobalKeydownEvent(disableSelectAll);

  // -- No hooks below -- //

  // Fatal error page
  if (jsonLines === null) {
    return (
      <div className="flex h-full flex-col font-mono">
        <Alert>{error?.message}</Alert>
        <div className="p-3 whitespace-pre">{jsonText}</div>
      </div>
    );
  }

  const toolbarProps = {
    jsonLines,
    viewerModeState: state.viewerMode,
    searchState: state.search,
    searchNavigation: state.searchNavigation.value,
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
      <div className="bg-viewer-background flex h-full min-h-[500px] min-w-[500px] flex-col overflow-hidden font-mono">
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
              // min-h-0 prevents overflow when showing an error banner (https://stackoverflow.com/a/66689926)
              "text-viewer-foreground min-h-0 flex-auto pt-1.5 pl-1.5 selection:bg-amber-200 selection:text-black",
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
  searchNavigation: StateObject<SearchNavigation>;
  jqCommand: StateObject<JQCommand>;
};

// Application state is stored in session and kept on page reload.
// Default state is customizable in settings but not available on first render,
// so we need to subscribe to update the state when settings are loaded,
// unless of course the state was already loaded from an existing session.
function useApplicationState(
  settings: Settings,
  isInputMultiline: boolean,
): ApplicationState {
  // Viewer mode
  const [viewer, setViewer, viewerWasInSession] = useSessionStorage(
    "viewer",
    settings.viewerMode,
  );
  if (!viewerWasInSession) {
    useEffect(() => setViewer(settings.viewerMode), [settings]);
  }

  // Search
  const [search, setSearch, searchWasInSession] = useSessionStorage(
    "search",
    EmptySearch,
  );
  if (!searchWasInSession) {
    useEffect(
      () => setSearch(updateField("visibility", settings.searchVisibility)),
      [settings],
    );
  }

  // Search navigation
  const [searchNavigation, setSearchNavigation] = useState(
    EmptySearchNavigation,
  );

  // JQ
  const [jq, setJQ] = useSessionStorage("jq", EmptyJQCommand);
  const [sessionSlurp] = useState<Nullable<boolean>>(jq.slurp);
  useEffect(() => {
    // Read default flag from settings if not already set in the session.
    const chosenSlurp = sessionSlurp ?? settings.jqSlurp;
    // Make sure slurp is null if input is not multiline
    setJQ(updateField("slurp", isInputMultiline ? chosenSlurp : null));
  }, [settings, isInputMultiline]);

  return {
    viewerMode: useStateObjectAdapter([viewer, setViewer]),
    search: useStateObjectAdapter([search, setSearch]),
    searchNavigation: useStateObjectAdapter([
      searchNavigation,
      setSearchNavigation,
    ]),
    jqCommand: useStateObjectAdapter([jq, setJQ]),
  };
}

type ViewerPropsParams = {
  state: ApplicationState;
  jsonLines: Nullable<Json.Lines>;
  isLargeJson: boolean;
  enableEnterNode: boolean;
};

// Defer state transition in case of large JSON in order to show loading placeholder
function useTransitionViewerProps({
  state,
  jsonLines,
  isLargeJson,
  enableEnterNode,
}: ViewerPropsParams): Nullable<ViewerProps> {
  const [nextProps, setNextProps] = useState<Nullable<ViewerProps>>(null);
  const deferredProps = useDeferredValue<Nullable<ViewerProps>>(nextProps);

  // Changes to these props will trigger a possibly expensive render of the viewer
  const transitionDeps = [
    // Transition between viewer modes
    state.viewerMode.value,
    // Viewer props
    jsonLines,
    state.search.value,
    isLargeJson,
    enableEnterNode,
  ];

  const targetProps = useMemo(() => {
    if (jsonLines === null) {
      // nothing to show
      return null;
    }

    return {
      jsonLines,
      search: state.search.value,
      setSearchNavigation: state.searchNavigation.setValue,
      isLargeJson,
      enableEnterNode,
    };
  }, transitionDeps);

  useEffect(() => {
    const updateTask = setTimeout(() => setNextProps(targetProps), 1);
    return () => clearTimeout(updateTask);
  }, [setNextProps, targetProps]);

  // If the JSON is small, target props are applied immediately
  if (!isLargeJson) {
    return targetProps;
  }

  // The JSON is large, target props will be applied after a short delay
  const isTransition = deferredProps !== targetProps;
  return isTransition ? null : deferredProps;
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

function isMultipleJsonLines(
  result: Json.Lines | Error | undefined | null,
): result is Json.Lines {
  return Array.isArray(result) && result.length > 1;
}

type JqErrorTitleProps = Props<{
  error: Error;
}>;

function JqErrorTitle(_props: JqErrorTitleProps): JSX.Element {
  const t = useContext(TranslationContext);
  return <div className={"font-bold"}>{t.toolbar.jq.genericError}</div>;
}
