import { getURL } from "@/viewer/commons/Runtime";
import classNames from "classnames";
import { JSX } from "react";

// The placeholder is a GIF instead of an animated SVG
// so that it doesn't freeze with the rest of the UI.
// Not my proudest achievement.
const LOADING_GIF = getURL("assets/images/loading.gif");

export type ViewerPlaceholderProps = BaseProps;

export function ViewerPlaceholder({
  className,
}: ViewerPlaceholderProps): JSX.Element {
  // fadeIn delay mitigates flickering on fast transitions
  return (
    <div className={classNames("mt-8 flex justify-center", className)}>
      <img
        className="h-20 w-20"
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
