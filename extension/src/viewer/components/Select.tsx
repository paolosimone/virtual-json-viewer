import classNames from "classnames";
import { Dispatch, FormEvent } from "react";

export type SelectProps<T extends string> = Props<{
  options: T[];
  setValue: Dispatch<T>;
  selected?: T;
}>;

export function Select<T extends string>({
  options,
  setValue,
  selected,
  className,
}: SelectProps<T>): JSX.Element {
  const setNewValue = (e: FormEvent<HTMLSelectElement>) => {
    const newValue = (e.target as HTMLSelectElement).value as T;
    setValue(newValue);
  };

  return (
    <select
      className={classNames("dark:bg-gray-500 focus:outline-none", className)}
      onChange={setNewValue}
      value={selected}
    >
      {options.map((opt: T) => (
        <option value={opt} key={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
