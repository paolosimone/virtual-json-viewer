import { Dispatch, useContext } from "react";
import { Select } from "viewer/components";
import {
  Language,
  languageLabels,
  LanguageSetting,
  SystemLanguage,
  TranslationContext,
} from "viewer/localization";

export type LanguageSelectProps = Props<{
  language: LanguageSetting;
  setLanguage: Dispatch<LanguageSetting>;
}>;

export function LanguageSelect({
  language,
  setLanguage,
  className,
}: LanguageSelectProps): JSX.Element {
  const t = useContext(TranslationContext);

  const systemOption = {
    value: SystemLanguage as LanguageSetting,
    label: t.settings.language.system,
  };

  const languageOptions = Object.values(Language).map((language) => ({
    value: language,
    label: languageLabels[language],
  }));

  return (
    <Select
      options={[systemOption].concat(languageOptions)}
      selected={language}
      setValue={setLanguage}
      className={className}
    />
  );
}
