import { useContext } from "react";
import { Select } from "viewer/components";
import { useTheme } from "viewer/hooks";
import { TranslationContext } from "viewer/localization";
import { SystemTheme, Theme, ThemeSetting } from "viewer/state";

export type ThemeSelectProps = Props<EmptyObject>;

export function ThemeSelect({ className }: ThemeSelectProps): JSX.Element {
  const t = useContext(TranslationContext);
  const [_asdf, theme, setTheme] = useTheme();

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
