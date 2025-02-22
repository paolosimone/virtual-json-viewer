import classNames from "classnames";
import { Dispatch, FormEvent, JSX } from "react";

export type CheckboxProps = Props<{
  setChecked: Dispatch<boolean>;
  checked?: boolean;
}>;

export function Checkbox({
  setChecked,
  checked,
  className,
}: CheckboxProps): JSX.Element {
  const setNewChecked = (e: FormEvent<HTMLInputElement>) => {
    const newChecked = (e.target as HTMLInputElement).checked;
    setChecked(newChecked);
  };

  return (
    <input
      type="checkbox"
      className={classNames(
        "bg-input-background cursor-pointer pl-1 focus:outline-hidden",
        className,
      )}
      onChange={setNewChecked}
      checked={checked}
    />
  );
}
