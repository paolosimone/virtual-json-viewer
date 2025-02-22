import classNames from "classnames";
import { Icon } from "./Icon";
import { JSX } from "react";

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
    <label className={classNames("rounded-sm", className)} title={title}>
      <CustomIcon />
    </label>
  );
}
