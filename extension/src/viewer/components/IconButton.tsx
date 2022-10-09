import classNames from "classnames";
import { ButtonHTMLAttributes, useContext } from "react";
import { ThemeContext, ThemeName } from "viewer/state";
import { Icon } from "./Icon";

export type IconButtonProps = Props<{
  icon: Icon;
  isActive?: boolean;
  dark?: boolean;
}> &
  ButtonHTMLAttributes<HTMLButtonElement>;

export function IconButton({
  icon: CustomIcon,
  onClick,
  title,
  isActive,
  disabled,
  className,
  dark,
  style,
  tabIndex,
}: IconButtonProps): JSX.Element {
  const darkTheme = useContext(ThemeContext).name === ThemeName.Dark;
  const useDark = dark !== undefined ? dark : darkTheme;

  const lightColors = {
    "hover:bg-gray-200": !disabled,
    "bg-gray-300": isActive,
  };

  const darkColors = {
    "hover:bg-gray-500": !disabled,
    "bg-gray-600": isActive,
  };

  return (
    <button
      className={classNames(
        "rounded",
        { "cursor-default": disabled },
        useDark ? darkColors : lightColors,
        className
      )}
      style={style}
      title={title}
      onClick={onClick}
      disabled={disabled}
      tabIndex={tabIndex}
    >
      <CustomIcon fill="fill-viewer-background" />
    </button>
  );
}
