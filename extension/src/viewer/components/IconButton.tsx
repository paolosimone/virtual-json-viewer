import classNames from "classnames";

export type IconButtonProps = Props<{
  title: string;
  icon: string;
  onClick: () => void;
  isActive?: boolean;
}>;

export function IconButton({
  title,
  icon,
  onClick,
  className,
  isActive,
}: IconButtonProps): JSX.Element {
  return (
    <button
      className={classNames(
        "px-0.5 rounded hover:bg-gray-200",
        { "bg-gray-300": isActive },
        className
      )}
      title={title}
      onClick={onClick}
    >
      <img src={`/icons/light/${icon}.svg`} alt={title} />
    </button>
  );
}
