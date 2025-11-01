import {
  StateObject,
  updateField,
  useSessionStorage,
  useStateObjectAdapter,
} from "@/viewer/hooks";
import {
  EmptyJQCommand,
  EmptySearch,
  EmptySearchNavigation,
  JQCommand,
  Search,
  SearchNavigation,
  Settings,
  ViewerMode,
} from "@/viewer/state";
import { useDeferredValue, useEffect, useState } from "react";

export type ApplicationState = {
  viewerMode: StateObject<ViewerMode>;
  search: StateObject<Search>;
  searchNavigation: StateObject<SearchNavigation>;
  searchStartingIndex: number;
  jqCommand: StateObject<JQCommand>;
};

// Application state is stored in session and kept on page reload.
// Default state is customizable in settings so it must be used as initial value,
// unless of course the state was already loaded from an existing session.
export function useApplicationState(
  settings: Settings,
  isInputMultiline: boolean,
): ApplicationState {
  // Viewer mode
  const [viewer, setViewer] = useSessionStorage("viewer", settings.viewerMode);

  // JQ
  const [jq, setJQ] = useSessionStorage("jq", EmptyJQCommand);
  const [sessionSlurp] = useState<Nullable<boolean>>(jq.slurp);
  useEffect(() => {
    // Read default flag from settings if not already set in the session.
    const chosenSlurp = sessionSlurp ?? settings.jqSlurp;
    // Make sure slurp is null if input is not multiline
    setJQ(updateField("slurp", isInputMultiline ? chosenSlurp : null));
  }, [settings, isInputMultiline]);

  // Search
  const [search, setSearch] = useSessionStorage("search", {
    ...EmptySearch,
    visibility: settings.searchVisibility,
  });

  // Search navigation
  const [searchNavigation, setSearchNavigation] = useState(
    EmptySearchNavigation,
  );

  // Preserve the selected search index on reloads
  const [searchStartingIndex, setSearchStartingIndex] =
    useSessionStorage<number>("search-index", 0);

  // Reset to 0 when parameters affecting search results change.
  // Update when navigation changes from user interaction.
  // NOTE: isFirstLoad is not a dependency on purpose to avoid resetting.
  const searchParams = `${jq.filter}|${jq.slurp}|${search.text}|${search.caseSensitive}`;
  const oldSearchParams = useDeferredValue<string>(searchParams);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  useEffect(() => {
    if (searchParams !== oldSearchParams) {
      setSearchStartingIndex(0);
    } else if (!isFirstLoad) {
      setSearchStartingIndex(searchNavigation.currentIndex ?? 0);
    }
    setIsFirstLoad(false);
  }, [oldSearchParams, searchParams, searchNavigation.currentIndex]);

  return {
    viewerMode: useStateObjectAdapter([viewer, setViewer]),
    search: useStateObjectAdapter([search, setSearch]),
    searchNavigation: useStateObjectAdapter([
      searchNavigation,
      setSearchNavigation,
    ]),
    searchStartingIndex,
    jqCommand: useStateObjectAdapter([jq, setJQ]),
  };
}
