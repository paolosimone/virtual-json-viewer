import { getURL } from "viewer/state";

export function ViewerPlaceholder(): JSX.Element {
  // The placeholder is a GIF instead of an animated SVG
  // so that it doesn't freeze with the rest of the UI.
  // Not my proudest achievement.
  return (
    <div className="flex justify-center mt-8">
      <img className="w-20 h-20" src={getURL("loading.gif")} alt="Loading..." />
    </div>
  );
}
