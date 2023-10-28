import classNames from "classnames";
import { Dispatch, FormEvent } from "react";

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
        "pl-1 bg-input-background focus:outline-none cursor-pointer",
        className,
      )}
      onChange={setNewChecked}
      checked={checked}
    />
  );
}
