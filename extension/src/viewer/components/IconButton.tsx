import classNames from "classnames";
import { Icon } from "./Icon";

// light theme
const fill = "#424242";

export type IconButtonProps = Props<{
  title: string;
  icon: Icon;
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
  // User-defined JSX elements require a capital letter
  const ButtonIcon = icon;

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
      <ButtonIcon fill={fill} />
    </button>
  );
}
