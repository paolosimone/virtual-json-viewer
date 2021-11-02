import { Dispatch } from "react";
import { useStorage } from "viewer/hooks";
import { FallbackLanguage, Language, LanguageSetting, SystemLanguage } from ".";

const KEY = "language";

export function useLocalizationSetting(): [
  LanguageSetting,
  Dispatch<LanguageSetting>
] {
  return useStorage<LanguageSetting>(KEY, SystemLanguage);
}

export function useLocalization(): Language {
  const [languageSetting] = useLocalizationSetting();

  return languageSetting === SystemLanguage
    ? resolveSystemLanguage()
    : languageSetting;
}

function resolveSystemLanguage(): Language {
  const systemLanguage = navigator.language.toLowerCase().substr(0, 2);
  const language = Object.values(Language).find(
    (lang) => lang === systemLanguage
  );
  return language ?? FallbackLanguage;
}
