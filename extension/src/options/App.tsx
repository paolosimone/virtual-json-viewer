import "tailwindcss/tailwind.css";
import { TranslationContext, useLocalization } from "viewer/localization";
import { LanguageSelect, ThemeSelect } from "./components";

export function App(): JSX.Element {
  const [t, language, setLanguage] = useLocalization();

  return (
    <TranslationContext.Provider value={t}>
      <div className="grid grid-cols-2 gap-3 p-10 dark:bg-gray-700 dark:text-gray-200 text-base">
        <label>{t.settings.labels.theme}</label>
        <ThemeSelect />

        <label>{t.settings.labels.language}</label>
        <LanguageSelect language={language} setLanguage={setLanguage} />
      </div>
    </TranslationContext.Provider>
  );
}
