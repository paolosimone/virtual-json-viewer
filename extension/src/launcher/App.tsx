import "@/global.css";
import { useTheme } from "@/viewer/hooks";
import classNames from "classnames";
import { Dispatch, JSX, useState } from "react";
import { OptionsWrapper } from "./OptionsWrapper";
import { ViewerWrapper } from "./ViewerWrapper";

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
    <div className="grid h-screen grid-cols-2 items-center gap-4 p-4">
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
        "text-toolbar-foreground bg-toolbar-background hover:bg-toolbar-focus rounded-md text-4xl",
        className,
      )}
      onClick={launch}
    >
      {title}
    </button>
  );
}
