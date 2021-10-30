import classNames from "classnames";
import { Icon } from "./Icon";

// light theme
const fill = "#424242";

export type IconButtonProps = Props<{
  icon: Icon;
  onClick: () => void;
  title?: string;
  isActive?: boolean;
  disabled?: boolean;
}>;

export function IconButton({
  icon: CustomIcon,
  onClick,
  title,
  isActive,
  disabled,
  className,
  style,
}: IconButtonProps): JSX.Element {
  return (
    <button
      className={classNames(
        "rounded",
        {
          "hover:bg-gray-200": !disabled,
          "cursor-default": disabled,
          "bg-gray-300": isActive,
        },
        className
      )}
      style={style}
      title={title}
      onClick={onClick}
      disabled={disabled}
    >
      <CustomIcon fill={fill} />
    </button>
  );
}
