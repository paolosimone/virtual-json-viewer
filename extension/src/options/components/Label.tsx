import classNames from "classnames";
import { JSX } from "react";
import style from "./Label.module.css";

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
      <label
        className={classNames(
          style["has-tooltip"],
          "cursor-help border-b border-dotted",
        )}
      >
        {children}

        <span
          className={classNames(
            style["tooltip"],
            "rounded-sm bg-black/80 text-white",
          )}
        >
          {tooltip}
        </span>
      </label>
    </div>
  );
}
