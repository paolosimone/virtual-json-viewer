import classNames from "classnames";
import { Icon } from "./Icon";

// light theme
const fill = "#424242";

export type IconLabelProps = Props<{
  icon: Icon;
  title?: string;
}>;

export function IconLabel({
  icon: CustomIcon,
  title,
  className,
  style,
}: IconLabelProps): JSX.Element {
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
