import classNames from "classnames";
import { getURL } from "viewer/state";

// The placeholder is a GIF instead of an animated SVG
// so that it doesn't freeze with the rest of the UI.
// Not my proudest achievement.
const LOADING_GIF = getURL("loading.gif");

export type ViewerPlaceholderProps = BaseProps;

export function ViewerPlaceholder({
  className,
}: ViewerPlaceholderProps): JSX.Element {
  return (
    <div className={classNames("flex justify-center mt-8", className)}>
      <img className="w-20 h-20" src={LOADING_GIF} alt="Loading..." />
    </div>
  );
}
