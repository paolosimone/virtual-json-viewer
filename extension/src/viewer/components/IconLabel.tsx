import classNames from "classnames";
import { useDarkThemeEnabled } from "viewer/hooks";
import { DARK_FILL, Icon, LIGHT_FILL } from "./Icon";

export type IconLabelProps = Props<{
  icon: Icon;
  title?: string;
  dark?: boolean;
}>;

export function IconLabel({
  icon: CustomIcon,
  title,
  className,
  dark,
  style,
}: IconLabelProps): JSX.Element {
  const darkTheme = useDarkThemeEnabled();
  const useDark = dark !== undefined ? dark : darkTheme;

  const fill = useDark ? DARK_FILL : LIGHT_FILL;

  return (
    <label
      className={classNames("rounded", className)}
      style={style}
      title={title}
    >
      <CustomIcon fill={fill} />
    </label>
  );
}
