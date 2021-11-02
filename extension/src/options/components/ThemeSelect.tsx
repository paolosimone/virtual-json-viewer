import { useContext } from "react";
import { Select } from "viewer/components";
import { useTheme } from "viewer/hooks";
import { TranslationContext } from "viewer/localization";
import { Theme } from "viewer/state";

export type ThemeSelectProps = Props<{}>;

export function ThemeSelect({ className }: ThemeSelectProps): JSX.Element {
  const t = useContext(TranslationContext);
  const [theme, setTheme] = useTheme();

  const options = Object.values(Theme).map((theme) => ({
    value: theme,
    label: t.settings.theme[theme],
  }));

  return (
    <Select
      options={options}
      selected={theme}
      setValue={setTheme}
      className={className}
    />
  );
}
