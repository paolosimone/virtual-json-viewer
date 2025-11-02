import { useStorage } from "@/viewer/hooks";
import { Dispatch, useMemo } from "react";
import {
  FallbackLanguage,
  Language,
  LanguageSetting,
  languageTranslations,
  SystemLanguage,
  Translation,
} from ".";

const KEY = "language";

export function useLocalization(): [
  Nullable<Translation>,
  Nullable<LanguageSetting>,
  Dispatch<LanguageSetting>,
] {
  const [language, setLanguage] = useStorage<LanguageSetting>(
    KEY,
    SystemLanguage,
  );

  const translation = useMemo(
    () => (language ? resolveTranslation(language) : null),
    [language],
  );

  return [translation, language, setLanguage];
}

function resolveTranslation(languageSetting: LanguageSetting) {
  const language =
    languageSetting === SystemLanguage
      ? resolveSystemLanguage()
      : languageSetting;

  return languageTranslations[language];
}

function resolveSystemLanguage(): Language {
  const systemLanguage = navigator.language.toLowerCase().substr(0, 2);
  const language = Object.values(Language).find(
    (lang) => lang === systemLanguage,
  );
  return language ?? FallbackLanguage;
}
