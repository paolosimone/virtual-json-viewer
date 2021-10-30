import classNames from "classnames";
import { Icon } from "./Icon";

// light theme
const fill = "#424242";

export type IconLabelProps = Props<{
  icon: Icon;
  title?: string;
}>;

export function IconLabel({
  title,
  icon,
  className,
  style,
}: IconLabelProps): JSX.Element {
  // JSX element requires a capital letter
  const CustomIcon = icon;

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
