import classNames from "classnames";
import * as Json from "viewer/commons/Json";
import { StateObject } from "viewer/hooks";
import { JQCommand, Search, ViewerMode } from "viewer/state";
import { JQCommandBox } from "./JQCommandBox";
import { OpenStateToggle } from "./OpenStateToggle";
import { SaveButton } from "./SaveButton";
import { SearchBox } from "./SearchBox";
import { ViewerModeToggle } from "./ViewerModeToggle";

export type ToolbarProps = Props<{
  json: Json.Root;
  viewerModeState: StateObject<ViewerMode>;
  searchState: StateObject<Search>;
  jqCommandState?: StateObject<JQCommand>;
}>;

export function Toolbar({
  json,
  viewerModeState,
  searchState,
  jqCommandState,
  className,
}: ToolbarProps): JSX.Element {
  const isTreeView = viewerModeState.value === ViewerMode.Tree;

  return (
    <div
      className={classNames(
        "flex flex-col py-1 px-0.5 bg-toolbar-background",
        className
      )}
    >
      <div className="flex items-center">
        <ViewerModeToggle
          className="w-14 h-7 ml-1"
          viewerMode={viewerModeState.value}
          setViewerMode={viewerModeState.setValue}
        />

        <Separator />

        <OpenStateToggle className="w-14 h-7 px-px" />

        <Separator />

        <SaveButton className="w-6 h-6 px-px" json={json} />

        <SearchBox
          className="flex-1 ml-2"
          search={searchState.value}
          setSearch={searchState.setValue}
          disableShowMismatch={!isTreeView}
        />
      </div>

      {jqCommandState && (
        <div className="pt-0.5">
          <JQCommandBox
            command={jqCommandState.value}
            setCommand={jqCommandState.setValue}
          />
        </div>
      )}
    </div>
  );
}

function Separator(): JSX.Element {
  return <div className="border-l border-toolbar-foreground/75 h-3/4 mx-2" />;
}
