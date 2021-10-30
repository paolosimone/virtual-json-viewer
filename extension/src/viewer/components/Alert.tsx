import classNames from "classnames";

export type AlertProps = Props<{
  message: string;
}>;

export function Alert({ message, className }: AlertProps): JSX.Element {
  return (
    <div
      className={classNames(
        "bg-red-500 bg-opacity-30 border border-red-800 text-red-900 whitespace-pre-wrap px-3",
        className
      )}
    >
      {message}
    </div>
  );
}
