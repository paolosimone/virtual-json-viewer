import { GlobalOptionsContext } from "@/options/Context";
import { Icon, IconButton, Select } from "@/viewer/components";
import { ThemeName } from "@/viewer/state";
import classNames from "classnames";
import { JSX, useContext } from "react";

export type ThemeSelectProps = Props<{
  onEdit: () => void;
}>;

export function ThemeSelect({
  className,
  onEdit,
}: ThemeSelectProps): JSX.Element {
  const { t, theme, setTheme } = useContext(GlobalOptionsContext);

  const themeOptions = SORTED_THEME_NAMES.map((name) => ({
    value: name,
    label: t.settings.theme[name],
  }));

  return (
    <span className={classNames(className, "flex gap-3")}>
      <Select
        options={themeOptions}
        selected={theme.name}
        setValue={(name) => setTheme({ ...theme, name: name })}
        className={"grow"}
      />
      {theme.name === ThemeName.Custom && (
        <IconButton
          title={t.settings.edit}
          className={"fill-viewer-foreground hover:bg-viewer-focus h-7 w-7"}
          icon={Icon.Edit}
          onClick={onEdit}
        />
      )}
    </span>
  );
}

const SORTED_THEME_NAMES = [
  ThemeName.System,
  ThemeName.Light,
  ThemeName.Dark,
  ThemeName.Custom,
];
