import classNames from "classnames";
import { ButtonHTMLAttributes, JSX } from "react";
import { Icon } from "./Icon";

export type IconButtonProps = Props<{
  icon: Icon;
}> &
  ButtonHTMLAttributes<HTMLButtonElement>;

export function IconButton({
  icon: CustomIcon,
  onClick,
  title,
  disabled,
  className,
  tabIndex,
}: IconButtonProps): JSX.Element {
  return (
    <button
      className={classNames("disabled:cursor-normal rounded-sm", className)}
      title={title}
      onClick={onClick}
      disabled={disabled}
      tabIndex={tabIndex}
    >
      <CustomIcon />
    </button>
  );
}
