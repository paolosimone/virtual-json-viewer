import classNames from "classnames";
import { useContext } from "react";
import { Theme, ThemeContext } from "viewer/state";
import { DARK_FILL, Icon, LIGHT_FILL } from "./Icon";

export type IconButtonProps = Props<{
  icon: Icon;
  onClick: () => void;
  title?: string;
  isActive?: boolean;
  disabled?: boolean;
  dark?: boolean;
}>;

export function IconButton({
  icon: CustomIcon,
  onClick,
  title,
  isActive,
  disabled,
  className,
  dark,
  style,
}: IconButtonProps): JSX.Element {
  const darkTheme = useContext(ThemeContext) === Theme.Dark;
  const useDark = dark !== undefined ? dark : darkTheme;

  const fill = useDark ? DARK_FILL : LIGHT_FILL;

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
    >
      <CustomIcon fill={fill} />
    </button>
  );
}
