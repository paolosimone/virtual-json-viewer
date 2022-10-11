import classNames from "classnames";
import { Icon } from "./Icon";

export type IconLabelProps = Props<{
  icon: Icon;
  title?: string;
  dark?: boolean;
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
      <CustomIcon fill="fill-black" />
    </label>
  );
}
