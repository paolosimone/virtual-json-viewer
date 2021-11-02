import "tailwindcss/tailwind.css";
import { Select } from "viewer/components";
import { useTheme } from "viewer/hooks";
import {
  languageSettingValues,
  useLocalizationSetting,
} from "viewer/localization";
import { Theme } from "viewer/state";

export function App(): JSX.Element {
  const [theme, setTheme] = useTheme();
  const [language, setLanguage] = useLocalizationSetting();

  return (
    <div className="grid grid-cols-2 p-4 dark:bg-gray-700 dark:text-gray-200 text-base">
      <label>Theme</label>
      <span>
        <Select
          options={Object.values(Theme)}
          selected={theme}
          setValue={setTheme}
        />
      </span>

      <label>Language</label>
      <span>
        <Select
          options={languageSettingValues}
          selected={language}
          setValue={setLanguage}
        />
      </span>
    </div>
  );
}
