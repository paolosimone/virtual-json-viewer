import classNames from "classnames";
import { JSX } from "react";

export type AlertProps = BaseProps;

export function Alert({ children, className }: AlertProps): JSX.Element {
  return (
    <div
      className={classNames("red-alert px-3 whitespace-pre-wrap", className)}
    >
      {children}
    </div>
  );
}
