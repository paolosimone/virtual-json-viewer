import classNames from "classnames";
import { JSX } from "react";
import style from "./Label.module.css";

export type LabelProps = Props<{
  text: string;
  tooltip: string;
}>;

export function Label({ text, tooltip, className }: LabelProps): JSX.Element {
  return (
    <div className={className}>
      <label
        className={classNames(
          style["has-tooltip"],
          "cursor-help border-b border-dotted",
        )}
      >
        {text}

        <span
          className={classNames(
            style["tooltip"],
            "rounded-sm bg-black/90 text-white",
          )}
        >
          {tooltip}
        </span>
      </label>
    </div>
  );
}
