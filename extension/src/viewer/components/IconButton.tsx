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
  title,
  icon,
  onClick,
  isActive,
  disabled,
  className,
  style,
}: IconButtonProps): JSX.Element {
  // JSX element requires a capital letter
  const CustomIcon = icon;

  return (
    <button
      className={classNames(
        "rounded",
        {
          "hover:bg-gray-200": !disabled,
          "cursor-not-allowed": disabled,
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
