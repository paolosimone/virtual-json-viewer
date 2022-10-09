import { Dispatch, useContext } from "react";
import { Select } from "viewer/components";
import { TranslationContext } from "viewer/localization";
import {
  SystemThemeName,
  Theme,
  ThemeName,
  ThemeSelection,
} from "viewer/state";

export type ThemeSelectProps = Props<{
  theme: Theme;
  setTheme: Dispatch<Theme>;
}>;

export function ThemeSelect({
  theme,
  setTheme,
  className,
}: ThemeSelectProps): JSX.Element {
  const t = useContext(TranslationContext);

  const systemOption = {
    value: SystemThemeName as ThemeSelection,
    label: t.settings.theme[SystemThemeName],
  };

  const themeOptions = Object.values(ThemeName).map((name) => ({
    value: name,
    label: t.settings.theme[name],
  }));

  // TODO
  return (
    <Select
      options={[systemOption].concat(themeOptions)}
      selected={theme.name}
      setValue={(name) => setTheme({ ...theme, name: name })}
      className={className}
    />
  );
}
