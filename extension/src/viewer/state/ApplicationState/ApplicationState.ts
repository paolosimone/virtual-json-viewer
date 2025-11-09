import {
  StateObject,
  updateField,
  useEffectMount,
  useSessionStorage,
  useStateObjectAdapter,
} from "@/viewer/hooks";
import { useDeferredValue, useEffect, useState } from "react";
import { EmptyJQCommand, JQCommand } from "../JQCommand";
import {
  EmptySearch,
  EmptySearchNavigation,
  Search,
  SearchNavigation,
} from "../Search";
import { Settings } from "../Settings";
import { ViewerMode } from "../ViewerMode";
import { URLFragmentState, useURLFragmentState } from "./URLFragmentState";

export type ApplicationState = {
  viewerMode: StateObject<ViewerMode>;
  search: StateObject<Search>;
  searchNavigation: StateObject<SearchNavigation>;
  searchStartingIndex: number;
  jqCommand: StateObject<JQCommand>;
};

// Application state is stored in session and optionally in URL to be kept on page reload.
// Default state is customizable in settings so it must be used as initial value,
// unless of course the state was already loaded from session.
export function useApplicationState(
  settings: Settings,
  isInputMultiline: boolean,
): ApplicationState {
  // URL fragment state
  const [urlState, setURLState] = useURLFragmentState(settings.enableURLState);

  // Viewer mode
  const startingViewerMode = urlState.viewerMode ?? settings.viewerMode;
  const [viewer, setViewer] = useSessionStorage("viewer", startingViewerMode);

  // JQ
  const startingJQCommand: JQCommand = {
    filter: urlState.jqFilter ?? EmptyJQCommand.filter,
    slurp: urlState.jqSlurp ?? EmptyJQCommand.slurp,
  };
  const [jq, setJQ] = useSessionStorage("jq", startingJQCommand);
  const [sessionSlurp] = useState<Nullable<boolean>>(jq.slurp);
  useEffect(() => {
    // Read default flag from settings if not already set in the session.
    const chosenSlurp = sessionSlurp ?? settings.jqSlurp;
    // Make sure slurp is null if input is not multiline
    setJQ(updateField("slurp", isInputMultiline ? chosenSlurp : null));
  }, [settings, isInputMultiline]);

  // Search
  const startingSearch: Search = {
    text: urlState.searchText ?? EmptySearch.text,
    visibility: urlState.searchVisibility ?? settings.searchVisibility,
    caseSensitive: urlState.searchCaseSensitive ?? EmptySearch.caseSensitive,
  };
  const [search, setSearch] = useSessionStorage("search", startingSearch);

  // Search navigation
  const [searchNavigation, setSearchNavigation] = useState(
    EmptySearchNavigation,
  );

  // Preserve the selected search index on reloads
  const startingSearchIndex = urlState.searchStartingIndex ?? 0;
  const [searchStartingIndex, setSearchStartingIndex] =
    useSessionStorage<number>("search-index", startingSearchIndex);
  let syncSearchStartingIndex = searchStartingIndex;

  // Reset to 0 when parameters affecting search results change.
  // It's done without useEffect to make sure it's applied synchronously to the changes.
  const searchParams = `${jq.filter}|${jq.slurp}|${search.text}|${search.caseSensitive}`;
  const oldSearchParams = useDeferredValue<string>(searchParams);
  if (searchParams !== oldSearchParams && searchStartingIndex !== 0) {
    syncSearchStartingIndex = 0;
    setSearchStartingIndex(0);
  }

  // Update when navigation changes from user interaction (i.e. not on first load)
  useEffectMount(
    (isMount) => {
      if (!isMount) {
        setSearchStartingIndex(searchNavigation.currentIndex ?? 0);
      }
    },
    [searchNavigation.currentIndex],
  );

  const state: ApplicationState = {
    viewerMode: useStateObjectAdapter([viewer, setViewer]),
    search: useStateObjectAdapter([search, setSearch]),
    searchNavigation: useStateObjectAdapter([
      searchNavigation,
      setSearchNavigation,
    ]),
    searchStartingIndex: syncSearchStartingIndex,
    jqCommand: useStateObjectAdapter([jq, setJQ]),
  };

  // Sync to URL fragment avoiding infinite loops by checking dependencies individually
  useEffect(
    () => setURLState(urlFragmentFromState(state)),
    [viewer, search, searchStartingIndex, jq],
  );

  return state;
}

function urlFragmentFromState(state: ApplicationState): URLFragmentState {
  const urlFragmentState: URLFragmentState = {};

  // State is meaningful to be exposed only if user entered a search/query.
  if (!state.search.value.text && !state.jqCommand.value.filter) {
    return urlFragmentState;
  }

  // Viewer mode
  urlFragmentState.viewerMode = state.viewerMode.value;

  // Search
  if (state.search.value.text) {
    urlFragmentState.searchText = state.search.value.text;
    urlFragmentState.searchVisibility = state.search.value.visibility;
    urlFragmentState.searchCaseSensitive = state.search.value.caseSensitive;
    urlFragmentState.searchStartingIndex = state.searchStartingIndex;
  }

  // JQ
  if (state.jqCommand.value.filter) {
    urlFragmentState.jqFilter = state.jqCommand.value.filter;
    urlFragmentState.jqSlurp = state.jqCommand.value.slurp;
  }

  return urlFragmentState;
}
