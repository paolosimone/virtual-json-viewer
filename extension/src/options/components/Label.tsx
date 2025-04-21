import { JSX } from "react";
import "./Label.css";

export type LabelProps = Props<{
  tooltip: string;
}>;

export function Label({
  children,
  tooltip,
  className,
}: LabelProps): JSX.Element {
  return (
    <div className={className}>
      <label className="has-tooltip cursor-help border-b border-dotted">
        {children}

        <span className="tooltip rounded-sm bg-black/80 text-white">
          {tooltip}
        </span>
      </label>
    </div>
  );
}
