import classNames from "classnames";
import { OptionsWrapper } from "./OptionsWrapper";
import { ViewerWrapper } from "./ViewerWrapper";

export function App(): JSX.Element {
  // extremely basic routing, no need for React Router
  switch (window.location.pathname) {
    case "/viewer":
      return <ViewerWrapper />;
    case "/options":
      return <OptionsWrapper />;
    default:
      return <PagePicker />;
  }
}

function PagePicker(): JSX.Element {
  return (
    <div className="h-screen p-4 grid grid-cols-2 gap-4 items-center">
      <LauncherButton className="h-1/2" title="Viewer" href="/viewer" />
      <LauncherButton className="h-1/2" title="Options" href="/options" />
    </div>
  );
}

type LauncherButtonProps = Props<{
  title: string;
  href: string;
}>;

function LauncherButton({ title, href, className }: LauncherButtonProps) {
  return (
    <button
      className={classNames(
        "rounded-md bg-gray-100 hover:bg-gray-200 text-4xl",
        className
      )}
      onClick={navigateTo(href)}
    >
      {title}
    </button>
  );
}

function navigateTo(href: string): () => void {
  return () => {
    window.location.href = href;
  };
}
