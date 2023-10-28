import classNames from "classnames";
import { Dispatch, FormEvent } from "react";

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
        "pl-1 bg-input-background text-input-foreground border border-input-focus focus:outline-none cursor-pointer",
        className,
      )}
      onChange={setNewValue}
      value={value}
      min={min}
      max={max}
    />
  );
}
