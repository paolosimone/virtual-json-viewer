import { useSettings, useTheme } from "@/viewer/hooks";
import { useLocalization } from "@/viewer/localization";
import { resolveTextSizeClass } from "@/viewer/state";
import classNames from "classnames";
import { JSX, useState } from "react";
import { GlobalOptionsContext, OptionsPage } from "./Context";
import { EditCustomTheme } from "./EditCustomTheme";
import { MainOptions } from "./MainOptions";

export function App(): JSX.Element {
  // extremely basic navigation inside options page
  const [page, gotoPage] = useState(OptionsPage.Main);

  // global context
  const [_, theme, setTheme] = useTheme();
  const [t, language, setLanguage] = useLocalization();
  const [settings, updateSettings] = useSettings();
  const ctx = {
    gotoPage: gotoPage,
    theme: theme,
    setTheme: setTheme,
    t: t,
    language: language,
    setLanguage: setLanguage,
    settings: settings,
    updateSettings: updateSettings,
  };

  const CurrentPage = buildPageElement(page);

  return (
    <GlobalOptionsContext.Provider value={ctx}>
      <CurrentPage
        className={classNames(
          "bg-viewer-background text-viewer-foreground min-h-[400px] min-w-[500px]",
          resolveTextSizeClass(settings.textSize),
        )}
      />
    </GlobalOptionsContext.Provider>
  );
}

type PageProps = BaseProps;
type PageElement = (props: PageProps) => JSX.Element;

function buildPageElement(page: OptionsPage): PageElement {
  switch (page) {
    case OptionsPage.EditTheme:
      return EditCustomTheme;

    default:
      return MainOptions;
  }
}
