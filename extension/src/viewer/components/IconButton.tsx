import classNames from "classnames";
import { ButtonHTMLAttributes } from "react";
import { Icon } from "./Icon";

export type IconButtonProps = Props<{
  icon: Icon;
  isActive?: boolean;
}> &
  ButtonHTMLAttributes<HTMLButtonElement>;

export function IconButton({
  icon: CustomIcon,
  onClick,
  title,
  isActive,
  disabled,
  className,
  style,
  tabIndex,
}: IconButtonProps): JSX.Element {
  // const lightColors = {
  //   "hover:bg-gray-200": !disabled,
  //   "bg-gray-300": isActive,
  // };

  const darkColors = {
    "hover:bg-gray-500": !disabled,
    "bg-gray-600": isActive,
  };

  // todo cursor pointer / disabled
  return (
    <button
      className={classNames(
        "rounded",
        { "cursor-default": disabled },
        darkColors,
        className
      )}
      style={style}
      title={title}
      onClick={onClick}
      disabled={disabled}
      tabIndex={tabIndex}
    >
      <CustomIcon fill="fill-black" />
    </button>
  );
}
