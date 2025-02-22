import classNames from "classnames";
import { Dispatch, JSX, useContext, useState } from "react";
import { ChromePicker } from "react-color";
import { Icon, IconButton } from "@/viewer/components";
import { FallbackTranslation } from "@/viewer/localization";
import { ColorKey, HexColor } from "@/viewer/state";
import { GlobalOptionsContext, OptionsPage } from "./Context";

export type EditCustomThemeProps = BaseProps;

type ColorSection = keyof typeof FallbackTranslation.settings.colors.sections;

export function EditCustomTheme({
  className,
}: EditCustomThemeProps): JSX.Element {
  const { t, gotoPage, theme, setTheme } = useContext(GlobalOptionsContext);

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
        className="grid grid-cols-3 gap-2 items-center pb-3"
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
        "relative flex flex-col items-stretch pt-2 px-8 pb-8 bg-viewer-background",
      )}
    >
      {/* back button */}
      <IconButton
        title={t.settings.close}
        className={
          "self-end w-7 h-7 fill-viewer-foreground hover:bg-viewer-focus"
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
        "flex text-black bg-white rounded-sm cursor-pointer p-0.5",
        className,
      )}
      onClick={onClick}
    >
      <div
        className="basis-1/6 shrink-0 border border-black rounded-sm"
        style={{ background: color }}
      />
      <span className="pl-3 grow">{colorName}</span>
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
