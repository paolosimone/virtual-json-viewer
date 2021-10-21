import classNames from "classnames";
import { Icon } from "./Icon";

// light theme
const fill = "#424242";

export type IconButtonProps = Props<{
  icon: Icon;
  onClick: () => void;
  title?: string;
  isActive?: boolean;
}>;

export function IconButton({
  title,
  icon,
  onClick,
  isActive,
  className,
  style,
}: IconButtonProps): JSX.Element {
  // User-defined JSX elements require a capital letter
  const ButtonIcon = icon;

  return (
    <button
      className={classNames(
        "rounded hover:bg-gray-200",
        { "bg-gray-300": isActive },
        className
      )}
      style={style}
      title={title}
      onClick={onClick}
    >
      <ButtonIcon fill={fill} />
    </button>
  );
}
