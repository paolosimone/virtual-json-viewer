import classNames from "classnames";
import { Dispatch, useContext, useState } from "react";
import { ChromePicker } from "react-color";
import { Icon, IconButton } from "viewer/components";
import { ColorKey, HexColor } from "viewer/state";
import { GlobalOptionsContext, OptionsPage } from "./Context";

export type EditCustomThemeProps = BaseProps;

export function EditCustomTheme({
  className,
}: EditCustomThemeProps): JSX.Element {
  const { gotoPage, theme, setTheme } = useContext(GlobalOptionsContext);

  const [pickerColorKey, setPickerColorKey] =
    useState<Nullable<ColorKey>>(null);

  const setThemeColor = (key: ColorKey, color: HexColor) =>
    setTheme({
      ...theme,
      customColors: { ...theme.customColors, [key]: color },
    });

  const previewPropsFor = (key: ColorKey) => ({
    colorKey: key,
    onClick: () => setPickerColorKey(key),
    color: theme.customColors[key],
    setColor: (color: HexColor) => setThemeColor(key, color),
  });

  const previewSectionColorsFor = (prefix: string) =>
    Object.keys(theme.customColors)
      .filter((key) => key.startsWith(prefix))
      .sort()
      .map((key) => (
        <ColorPreview key={key} {...previewPropsFor(key as ColorKey)} />
      ));

  return (
    <div
      className={classNames(
        className,
        "relative flex flex-col pt-2 px-8 pb-8 bg-viewer-background"
      )}
    >
      {/* back button */}
      <IconButton
        className={
          "self-end w-7 h-7 fill-viewer-foreground hover:bg-viewer-focus"
        }
        icon={Icon.Close}
        onClick={() => gotoPage(OptionsPage.Main)}
      />

      {/* color preview */}
      <h1 className="mb-4 font-semibold">Viewer</h1>
      <div className="grid grid-cols-3 gap-2 items-center">
        {previewSectionColorsFor("viewer")}
      </div>

      <h1 className="my-4 font-semibold">Toolbar</h1>
      <div className="grid grid-cols-3 gap-2 items-center">
        {previewSectionColorsFor("toolbar")}
      </div>

      <h1 className="my-4 font-semibold">Json</h1>
      <div className="grid grid-cols-3 gap-2 items-center">
        {previewSectionColorsFor("json")}
      </div>

      {/* color picker popup */}
      {pickerColorKey && (
        <div>
          <div
            className="fixed inset-0 z-10 backdrop-blur-sm"
            onClick={() => setPickerColorKey(null)}
          />
          <ColorPicker
            className="absolute-center z-50"
            color={theme.customColors[pickerColorKey]}
            setColor={(color) => setThemeColor(pickerColorKey, color)}
          />
        </div>
      )}
    </div>
  );
}

export type ColorPreviewProps = Props<{
  colorKey: ColorKey;
  color: HexColor;
  setColor: Dispatch<HexColor>;
  onClick: () => void;
}>;

export function ColorPreview({
  colorKey,
  color,
  className,
  onClick,
}: ColorPreviewProps): JSX.Element {
  return (
    <div
      className={classNames(
        "flex text-black bg-white rounded cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div
        className="basis-1/6 shrink-0 border border-black rounded"
        style={{ background: color }}
      />
      <span className="pl-3 grow">{colorKey}</span>
    </div>
  );
}

export type ColorPickerProps = Props<{
  color: HexColor;
  setColor: Dispatch<HexColor>;
}>;

export function ColorPicker({
  color,
  setColor,
  className,
}: ColorPickerProps): JSX.Element {
  const [tempColor, setTempColor] = useState<HexColor>(color);

  return (
    <div className={className}>
      <ChromePicker
        color={tempColor}
        onChange={(color) => setTempColor(color.hex)}
        onChangeComplete={(color) => setColor(color.hex)}
        disableAlpha={true}
      />
    </div>
  );
}
