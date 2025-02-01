import classNames from "classnames";
import { JSX } from "react";

export type AlertProps = BaseProps;

export function Alert({ children, className }: AlertProps): JSX.Element {
  return (
    <div
      className={classNames("red-alert whitespace-pre-wrap px-3", className)}
    >
      {children}
    </div>
  );
}
