import { DispatchSettings } from "@/viewer/hooks";
import {
  FallbackLanguage,
  LanguageSetting,
  languageTranslations,
  SystemLanguage,
  Translation,
} from "@/viewer/localization";
import { DefaultSettings, DefaultTheme, Settings, Theme } from "@/viewer/state";
import { createContext, Dispatch } from "react";

// navigation
export enum OptionsPage {
  Main = "main",
  EditTheme = "theme",
}

// don't try this at home
export type OptionsContext = {
  theme: Theme;
  setTheme: Dispatch<Theme>;
  t: Translation;
  language: LanguageSetting;
  setLanguage: Dispatch<LanguageSetting>;
  settings: Settings;
  updateSettings: DispatchSettings;
};

export const GlobalOptionsContext = createContext<OptionsContext>({
  theme: DefaultTheme,
  setTheme: doNothing,
  t: languageTranslations[FallbackLanguage],
  language: SystemLanguage,
  setLanguage: doNothing,
  settings: DefaultSettings,
  updateSettings: doNothing,
});

function doNothing(_input: any) {}
