import classNames from "classnames";
import { Icon } from "./Icon";

export type IconLabelProps = Props<{
  icon: Icon;
  title?: string;
}>;

export function IconLabel({
  icon: CustomIcon,
  title,
  className,
}: IconLabelProps): JSX.Element {
  return (
    <label className={classNames("rounded", className)} title={title}>
      <CustomIcon />
    </label>
  );
}
