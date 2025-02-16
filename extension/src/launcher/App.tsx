import classNames from "classnames";
import "@/global.css";
import { useTheme } from "@/viewer/hooks";
import { OptionsWrapper } from "./OptionsWrapper";
import { ViewerWrapper } from "./ViewerWrapper";
import { Dispatch, JSX, useState } from "react";

type Page = "launcher" | "viewer" | "options";

export function App(): JSX.Element {
  const [_colors] = useTheme();
  const [page, setPage] = useState<Page>("launcher");

  // extremely basic routing
  switch (page) {
    case "viewer":
      return <ViewerWrapper />;
    case "options":
      return <OptionsWrapper />;
    default:
      return <PagePicker setPage={setPage} />;
  }
}

type PagePickerProps = Props<{
  setPage: Dispatch<Page>;
}>;

function PagePicker({ setPage }: PagePickerProps): JSX.Element {
  return (
    <div className="h-screen p-4 grid grid-cols-2 gap-4 items-center">
      <LauncherButton
        className="h-1/2"
        title="Viewer"
        launch={() => setPage("viewer")}
      />
      <LauncherButton
        className="h-1/2"
        title="Options"
        launch={() => setPage("options")}
      />
    </div>
  );
}

type LauncherButtonProps = Props<{
  title: string;
  launch: () => void;
}>;

function LauncherButton({ title, launch, className }: LauncherButtonProps) {
  return (
    <button
      className={classNames(
        "rounded-md text-toolbar-foreground bg-toolbar-background hover:bg-toolbar-focus text-4xl",
        className,
      )}
      onClick={launch}
    >
      {title}
    </button>
  );
}
