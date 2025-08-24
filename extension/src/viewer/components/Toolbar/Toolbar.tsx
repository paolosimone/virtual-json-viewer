import * as Json from "@/viewer/commons/Json";
import { StateObject } from "@/viewer/hooks";
import {
  JQCommand,
  Search,
  SearchNavigation,
  ViewerMode,
} from "@/viewer/state";
import classNames from "classnames";
import { JSX } from "react";
import { JQCommandBox } from "./JQCommandBox";
import { OpenStateToggle } from "./OpenStateToggle";
import { SaveButton } from "./SaveButton";
import { SearchBox } from "./SearchBox";
import { ViewerModeToggle } from "./ViewerModeToggle";

export type ToolbarProps = Props<{
  jsonLines: Json.Lines;
  viewerModeState: StateObject<ViewerMode>;
  searchState: StateObject<Search>;
  searchNavigation: SearchNavigation;
  jqCommandState?: StateObject<JQCommand>;
}>;

export function Toolbar({
  jsonLines,
  viewerModeState,
  searchState,
  searchNavigation,
  jqCommandState,
  className,
}: ToolbarProps): JSX.Element {
  const isTreeView = viewerModeState.value === ViewerMode.Tree;

  return (
    <div
      className={classNames(
        "bg-toolbar-background flex flex-col px-0.5 py-1",
        className,
      )}
    >
      <div className="flex items-center">
        <ViewerModeToggle
          className="ml-1 h-7 w-14"
          viewerMode={viewerModeState.value}
          setViewerMode={viewerModeState.setValue}
        />

        <Separator />

        <OpenStateToggle className="h-7 w-14 px-px" />

        <Separator />

        <SaveButton className="h-6 w-6 px-px" jsonLines={jsonLines} />

        <SearchBox
          className="ml-2 flex-1"
          search={searchState.value}
          setSearch={searchState.setValue}
          navigation={searchNavigation}
          enableVisibility={isTreeView}
        />
      </div>

      {jqCommandState && (
        <div className="pt-1">
          <JQCommandBox
            command={jqCommandState.value}
            setCommand={jqCommandState.setValue}
            isMultilineOutput={jsonLines.length > 1}
          />
        </div>
      )}
    </div>
  );
}

function Separator(): JSX.Element {
  return <div className="border-toolbar-foreground/75 mx-2 h-3/4 border-l" />;
}
