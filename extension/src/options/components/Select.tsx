import classNames from "classnames";
import { Dispatch, FormEvent, JSX } from "react";

export type Option<T extends string> = {
  value: T;
  label: string;
};

export type SelectProps<T extends string> = Props<{
  options: Option<T>[];
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
      className={classNames(
        "bg-input-background text-input-foreground border border-input-focus focus:outline-hidden cursor-pointer",
        className,
      )}
      onChange={setNewValue}
      value={selected}
    >
      {options.map((opt) => (
        <option value={opt.value} key={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
