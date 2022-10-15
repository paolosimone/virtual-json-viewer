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

export const languageLabels: Record<Language, string> = {
  [Language.English]: "English",
  [Language.Italian]: "Italiano",
};

export const FallbackLanguage = Language.English;
export const FallbackTranslation = languageTranslations[FallbackLanguage];
export const TranslationContext = createContext(FallbackTranslation);

export const SystemLanguage = "system";
export type LanguageSetting = Language | typeof SystemLanguage;
