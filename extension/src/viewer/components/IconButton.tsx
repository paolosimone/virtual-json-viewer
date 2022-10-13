import classNames from "classnames";
import { ButtonHTMLAttributes } from "react";
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
      className={classNames("rounded disabled:cursor-normal", className)}
      title={title}
      onClick={onClick}
      disabled={disabled}
      tabIndex={tabIndex}
    >
      <CustomIcon />
    </button>
  );
}
