import { Icon, IconButton } from "@/viewer/components";
import { FallbackTranslation } from "@/viewer/localization";
import { ColorKey, HexColor } from "@/viewer/state";
import classNames from "classnames";
import { Dispatch, JSX, useContext, useState } from "react";
import { ChromePicker } from "react-color";
import { GlobalOptionsContext, OptionsPage } from "./Context";

export type EditCustomThemeProps = Props<{
  gotoPage: Dispatch<OptionsPage>;
}>;

type ColorSection = keyof typeof FallbackTranslation.settings.colors.sections;

export function EditCustomTheme({
  gotoPage,
  className,
}: EditCustomThemeProps): JSX.Element {
  const { t, theme, setTheme } = useContext(GlobalOptionsContext);

  const [pickerColorKey, setPickerColorKey] =
    useState<Nullable<ColorKey>>(null);

  const setThemeColor = (key: ColorKey, color: HexColor) =>
    setTheme({
      ...theme,
      customColors: { ...theme.customColors, [key]: color },
    });

  const previewPropsFor = (key: ColorKey) => ({
    colorName: t.settings.colors.names[key],
    onClick: () => setPickerColorKey(key),
    color: theme.customColors[key],
    setColor: (color: HexColor) => setThemeColor(key, color),
  });

  const previewSectionColorsFor = (section: ColorSection) => (
    <div key={section} className="grow">
      <h1 key={`${section}Title`} className="pb-2 font-semibold">
        {t.settings.colors.sections[section]}
      </h1>

      <div
        key={`${section}Colors`}
        className="grid grid-cols-3 items-center gap-2 pb-3"
      >
        {Object.keys(theme.customColors)
          .filter((key) => key.startsWith(section))
          .sort()
          .map((key) => (
            <ColorPreview key={key} {...previewPropsFor(key as ColorKey)} />
          ))}
      </div>
    </div>
  );

  return (
    <div
      className={classNames(
        className,
        "bg-viewer-background relative flex flex-col items-stretch px-8 pt-2 pb-8",
      )}
    >
      {/* back button */}
      <IconButton
        title={t.settings.close}
        className={
          "fill-viewer-foreground hover:bg-viewer-focus h-7 w-7 self-end"
        }
        icon={Icon.Close}
        onClick={() => gotoPage(OptionsPage.Main)}
      />

      {/* color preview */}
      {SORTED_COLOR_SECTIONS.map(previewSectionColorsFor)}

      {/* color picker popup */}
      {pickerColorKey && (
        <div>
          <div
            className="fixed inset-0 z-10 backdrop-blur-xs"
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

const SORTED_COLOR_SECTIONS: ColorSection[] = [
  "json",
  "viewer",
  "toolbar",
  "input",
];

export type ColorPreviewProps = Props<{
  colorName: string;
  color: HexColor;
  setColor: Dispatch<HexColor>;
  onClick: () => void;
}>;

export function ColorPreview({
  colorName,
  color,
  className,
  onClick,
}: ColorPreviewProps): JSX.Element {
  return (
    <div
      className={classNames(
        "flex cursor-pointer rounded-sm bg-white p-0.5 text-black",
        className,
      )}
      onClick={onClick}
    >
      <div
        className="shrink-0 basis-1/6 rounded-sm border border-black"
        style={{ background: color }}
      />
      <span className="grow pl-3">{colorName}</span>
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
