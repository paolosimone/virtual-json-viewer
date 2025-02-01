import classNames from "classnames";
import { JSX } from "react";
import { getURL } from "viewer/state";

// The placeholder is a GIF instead of an animated SVG
// so that it doesn't freeze with the rest of the UI.
// Not my proudest achievement.
const LOADING_GIF = getURL("loading.gif");

export type ViewerPlaceholderProps = BaseProps;

export function ViewerPlaceholder({
  className,
}: ViewerPlaceholderProps): JSX.Element {
  // fadeIn delay mitigates flickering on fast transitions
  return (
    <div className={classNames("flex justify-center mt-8", className)}>
      <img
        className="w-20 h-20"
        style={{
          animationName: "fadeIn",
          animationDelay: "10ms",
          animationDuration: "500ms",
          animationFillMode: "both",
        }}
        src={LOADING_GIF}
        alt="Loading..."
      />
    </div>
  );
}
