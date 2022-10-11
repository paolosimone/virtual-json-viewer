import classNames from "classnames";
import { GlobalOptionsContext } from "options/Context";
import { useContext } from "react";
import { Icon, IconButton, Select } from "viewer/components";
import { ThemeName } from "viewer/state";

export type ThemeSelectProps = Props<{
  onEdit: () => void;
}>;

export function ThemeSelect({
  className,
  onEdit,
}: ThemeSelectProps): JSX.Element {
  const { t, theme, setTheme } = useContext(GlobalOptionsContext);

  const themeOptions = Object.values(ThemeName).map((name) => ({
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
          className={"basis-1/12"}
          icon={Icon.Edit}
          onClick={onEdit}
        />
      )}
    </span>
  );
}
