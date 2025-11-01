import { getURL } from "@/viewer/state";
import classNames from "classnames";
import { JSX, useMemo } from "react";

export type ViewerPlaceholderProps = BaseProps;

export function ViewerPlaceholder({
  className,
}: ViewerPlaceholderProps): JSX.Element {
  // The placeholder is a GIF instead of an animated SVG
  // so that it doesn't freeze with the rest of the UI.
  const loadingGif = useMemo(() => getURL("assets/images/loading.gif"), []);

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
        src={loadingGif}
        alt="Loading..."
      />
    </div>
  );
}
