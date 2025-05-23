import classNames from "classnames";
import { Dispatch, FormEvent, JSX } from "react";

export type NumberInputProps = Props<{
  setValue: Dispatch<number>;
  value?: number;
  min?: number;
  max?: number;
}>;

export function NumberInput({
  setValue,
  value,
  min,
  max,
  className,
}: NumberInputProps): JSX.Element {
  const setNewValue = (e: FormEvent<HTMLInputElement>) => {
    let newValue = Number((e.target as HTMLInputElement).value);
    if (min !== undefined) {
      newValue = Math.max(min, newValue);
    }
    if (max !== undefined) {
      newValue = Math.min(newValue, max);
    }
    setValue(newValue);
  };

  return (
    <input
      type="number"
      className={classNames(
        "bg-input-background text-input-foreground border-input-focus cursor-pointer border pl-1 focus:outline-hidden",
        className,
      )}
      onChange={setNewValue}
      value={value}
      min={min}
      max={max}
    />
  );
}
