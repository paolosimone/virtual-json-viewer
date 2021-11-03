import { Dispatch, useContext } from "react";
import { Select } from "viewer/components";
import { TranslationContext } from "viewer/localization";
import { TextSize } from "viewer/state";

export type TextSizeSelectProps = Props<{
  textSize: TextSize;
  setTextSize: Dispatch<TextSize>;
}>;

export function TextSizeSelect({
  textSize,
  setTextSize,
  className,
}: TextSizeSelectProps): JSX.Element {
  const t = useContext(TranslationContext);

  const options = Object.values(TextSize).map((textSize) => ({
    value: textSize,
    label: t.settings.textSize[textSize],
  }));

  return (
    <Select
      options={options}
      selected={textSize}
      setValue={setTextSize}
      className={className}
    />
  );
}
