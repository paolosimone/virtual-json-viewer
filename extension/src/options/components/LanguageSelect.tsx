import { GlobalOptionsContext } from "@/options/Context";
import { Select } from "@/viewer/components";
import {
  Language,
  languageLabels,
  LanguageSetting,
  SystemLanguage,
} from "@/viewer/localization";
import { JSX, useContext } from "react";

export type LanguageSelectProps = BaseProps;

export function LanguageSelect({
  className,
}: LanguageSelectProps): JSX.Element {
  const { t, language, setLanguage } = useContext(GlobalOptionsContext);

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
