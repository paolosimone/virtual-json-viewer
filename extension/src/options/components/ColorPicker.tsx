import classNames from "classnames";
import { Dispatch, useState } from "react";
import { ChromePicker } from "react-color";
import { HexColor } from "viewer/state";

export type ColorPickerProps = Props<{
  color: HexColor;
  setColor: Dispatch<HexColor>;
}>;

export function ColorPicker({
  color,
  setColor,
  className,
}: ColorPickerProps): JSX.Element {
  const [display, setDisplay] = useState(false);

  // TODO separate the two elements, remove fixed position
  return (
    <div className={classNames("w-full h-full", className)}>
      {/* color preview */}
      <div
        className="w-full h-full p-1 bg-white rounded inline-block cursor-pointer"
        onClick={() => setDisplay(!display)}
      >
        <div className="w-full h-full rounded" style={{ background: color }} />
      </div>

      {/* color picker popup */}
      {display && (
        <div>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setDisplay(false)}
          />
          <div className="fixed right-1/2 bottom-1/2 translate-x-1/2 translate-x-1/2 z-50">
            <ChromePicker
              color={color}
              onChangeComplete={(color) => setColor(color.hex)}
              disableAlpha={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
