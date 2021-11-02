import { createContext } from "react";
import en from "./translations/en.json";
import it from "./translations/it.json";

export enum Language {
  English = "en",
  Italian = "it",
}

export type Translation = typeof en;

export const languageTranslations: Record<Language, Translation> = {
  [Language.English]: en,
  [Language.Italian]: it,
};

export const FallbackLanguage = Language.English;
export const TranslationContext = createContext(
  languageTranslations[FallbackLanguage]
);

export const SystemLanguage = "system";
export type LanguageSetting = Language | typeof SystemLanguage;
export const languageSettingValues = [SystemLanguage as LanguageSetting].concat(
  Object.values(Language)
);
