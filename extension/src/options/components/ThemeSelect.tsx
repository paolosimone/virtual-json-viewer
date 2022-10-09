import classNames from "classnames";
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
  onEdit: () => void;
}>;

export function ThemeSelect({
  theme,
  setTheme,
  className,
  onEdit,
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

  // TODO edit icon
  return (
    <span className={classNames(className, "flex gap-4")}>
      <Select
        options={[systemOption].concat(themeOptions)}
        selected={theme.name}
        setValue={(name) => setTheme({ ...theme, name: name })}
        className={"grow"}
      />
      <button className={"flex-none"} onClick={onEdit}>
        edit
      </button>
    </span>
  );
}
