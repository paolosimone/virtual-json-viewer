import classNames from "classnames";
import "tailwindcss/tailwind.css";
import { useSettings, useTheme } from "viewer/hooks";
import { TranslationContext, useLocalization } from "viewer/localization";
import { resolveTextSizeClass, TextSize } from "viewer/state";
import {
  LanguageSelect,
  NumberInput,
  TextSizeSelect,
  ThemeSelect,
} from "./components";

export function App(): JSX.Element {
  const [_, theme, setTheme] = useTheme();
  const [t, language, setLanguage] = useLocalization();
  const [settings, updateSettings] = useSettings();

  return (
    <TranslationContext.Provider value={t}>
      <div
        className={classNames(
          "grid grid-cols-2 gap-3 p-10 dark:bg-gray-700 dark:text-gray-200",
          resolveTextSizeClass(settings.textSize)
        )}
      >
        <label>{t.settings.labels.theme}</label>
        <ThemeSelect theme={theme} setTheme={setTheme} />

        <label>{t.settings.labels.language}</label>
        <LanguageSelect language={language} setLanguage={setLanguage} />

        <label>{t.settings.labels.textSize}</label>
        <TextSizeSelect
          textSize={settings.textSize}
          setTextSize={(newTextSize: TextSize) =>
            updateSettings({ textSize: newTextSize })
          }
        />

        <label>{t.settings.labels.indentation}</label>
        <NumberInput
          min={1}
          value={settings.indentation}
          setValue={(newValue: number) =>
            updateSettings({ indentation: newValue })
          }
        />
      </div>
    </TranslationContext.Provider>
  );
}
