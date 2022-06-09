import classNames from "classnames";
import "tailwindcss/tailwind.css";
import { useSettings, useTheme } from "viewer/hooks";
import {
  SystemLanguage,
  TranslationContext,
  useLocalization,
} from "viewer/localization";
import {
  DefaultSettings,
  resolveTextSizeClass,
  SystemTheme,
  TextSize,
} from "viewer/state";
import {
  Checkbox,
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
          "flex flex-col p-8 dark:bg-gray-700 dark:text-gray-200",
          resolveTextSizeClass(settings.textSize)
        )}
      >
        <div className="grid grid-cols-2 gap-3 items-center">
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

          <label>{t.settings.labels.searchDelay}</label>
          <NumberInput
            min={0}
            value={settings.searchDelay}
            setValue={(newValue: number) =>
              updateSettings({ searchDelay: newValue })
            }
          />

          <label>{t.settings.labels.linkifyUrls}</label>
          <Checkbox
            checked={settings.linkifyUrls}
            setChecked={(checked: boolean) =>
              updateSettings({ linkifyUrls: checked })
            }
          />
        </div>

        <div className="flex items-center justify-center pt-6">
          <button
            className="p-1.5 border rounded-lg text-red-900 dark:text-red-300 border-red-800 bg-red-800 bg-opacity-10 hover:bg-opacity-20 "
            onClick={() => {
              setTheme(SystemTheme);
              setLanguage(SystemLanguage);
              updateSettings(DefaultSettings);
            }}
          >
            {t.settings.reset}
          </button>
        </div>
      </div>
    </TranslationContext.Provider>
  );
}
