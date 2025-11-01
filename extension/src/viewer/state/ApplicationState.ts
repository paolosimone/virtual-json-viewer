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
import { useEffect, useState } from "react";

export type ApplicationState = {
  viewerMode: StateObject<ViewerMode>;
  search: StateObject<Search>;
  searchNavigation: StateObject<SearchNavigation>;
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

  // Search
  const [search, setSearch] = useSessionStorage("search", {
    ...EmptySearch,
    visibility: settings.searchVisibility,
  });

  // Search navigation - Can't store in session because it gets reset on viewer load.
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
