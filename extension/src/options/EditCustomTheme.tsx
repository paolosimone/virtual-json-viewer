import classNames from "classnames";
import { Dispatch } from "react";
import { Icon, IconButton } from "viewer/components";
import { useTheme } from "viewer/hooks";
import { HexColor, ThemeColors } from "viewer/state";
import { ColorPicker } from "./components";
import { OptionsPage } from "./Navigation";

export type EditCustomThemeProps = {
  gotoPage: Dispatch<OptionsPage>;
};

export function EditCustomTheme({
  gotoPage,
}: EditCustomThemeProps): JSX.Element {
  const [_, theme, setTheme] = useTheme();

  const pickerPropsFor = (key: keyof ThemeColors) => ({
    color: theme.customColors[key],
    setColor: (color: HexColor) =>
      setTheme({
        ...theme,
        customColors: { ...theme.customColors, [key]: color },
      }),
  });

  return (
    <div className={classNames("flex flex-col p-8 bg-viewer-background")}>
      <IconButton
        className={"self-end w-7 h-7"}
        icon={Icon.Close}
        isActive={true}
        onClick={() => gotoPage(OptionsPage.Main)}
      />
      <div className="grid grid-cols-2 gap-3 items-center">
        <label>background</label>
        <ColorPicker {...pickerPropsFor("viewerBackground")} />
      </div>
    </div>
  );
}
