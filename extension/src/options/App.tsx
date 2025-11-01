import { useSettings, useTheme } from "@/viewer/hooks";
import { useLocalization } from "@/viewer/localization";
import { resolveTextSizeClass } from "@/viewer/state";
import classNames from "classnames";
import { Dispatch, JSX, useState } from "react";
import { GlobalOptionsContext, OptionsContext, OptionsPage } from "./Context";
import { EditCustomTheme } from "./EditCustomTheme";
import { MainOptions } from "./MainOptions";

export function App(): JSX.Element {
  // global context
  const [theme, setTheme] = useTheme();
  const [t, language, setLanguage] = useLocalization();
  const [settings, updateSettings] = useSettings();

  const isLoaded =
    theme != null && t != null && language != null && settings != null;

  return isLoaded ? (
    <LoadedApp
      context={{
        theme,
        setTheme,
        t,
        language,
        setLanguage,
        settings,
        updateSettings,
      }}
    />
  ) : (
    <div />
  );
}

type LoadedAppProps = {
  context: OptionsContext;
};

function LoadedApp({ context }: LoadedAppProps): JSX.Element {
  // extremely basic navigation inside options page
  const [page, gotoPage] = useState(OptionsPage.Main);

  const CurrentPage = buildPageElement(page);

  return (
    <GlobalOptionsContext.Provider value={context}>
      <CurrentPage
        gotoPage={gotoPage}
        className={classNames(
          "bg-viewer-background text-viewer-foreground min-h-[400px] min-w-[500px]",
          resolveTextSizeClass(context.settings.textSize),
        )}
      />
    </GlobalOptionsContext.Provider>
  );
}

type PageProps = Props<{
  gotoPage: Dispatch<OptionsPage>;
}>;

type PageElement = (props: PageProps) => JSX.Element;

function buildPageElement(page: OptionsPage): PageElement {
  switch (page) {
    case OptionsPage.EditTheme:
      return EditCustomTheme;

    default:
      return MainOptions;
  }
}
