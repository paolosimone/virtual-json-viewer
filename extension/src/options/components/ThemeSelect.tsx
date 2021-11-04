import { Dispatch, useContext } from "react";
import { Select } from "viewer/components";
import { TranslationContext } from "viewer/localization";
import { SystemTheme, Theme, ThemeSetting } from "viewer/state";

export type ThemeSelectProps = Props<{
  theme: ThemeSetting;
  setTheme: Dispatch<ThemeSetting>;
}>;

export function ThemeSelect({
  theme,
  setTheme,
  className,
}: ThemeSelectProps): JSX.Element {
  const t = useContext(TranslationContext);

  const systemOption = {
    value: SystemTheme as ThemeSetting,
    label: t.settings.theme[SystemTheme],
  };

  const themeOptions = Object.values(Theme).map((theme) => ({
    value: theme,
    label: t.settings.theme[theme],
  }));

  return (
    <Select
      options={[systemOption].concat(themeOptions)}
      selected={theme}
      setValue={setTheme}
      className={className}
    />
  );
}
