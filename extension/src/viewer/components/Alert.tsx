import classNames from "classnames";

export type AlertProps = Props<{
  message: string;
}>;

export function Alert({ message, className }: AlertProps): JSX.Element {
  return (
    <div
      className={classNames("red-alert whitespace-pre-wrap px-3", className)}
    >
      {message}
    </div>
  );
}
