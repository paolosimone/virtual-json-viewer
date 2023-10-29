import { Dispatch } from "react";
import { Select } from "viewer/components";

export type EnumType = { [key: string]: string };
export type ValueOf<T> = T[keyof T];

export type EnumSelectProps<T extends EnumType> = Props<{
  enumType: T;
  labels: Record<ValueOf<T>, string>;
  value: ValueOf<T>;
  setValue: Dispatch<ValueOf<T>>;
}>;

export function EnumSelect<T extends EnumType>({
  enumType,
  labels,
  value,
  setValue,
  className,
}: EnumSelectProps<T>): JSX.Element {
  const options = Object.values(enumType).map((value) => ({
    value: value as ValueOf<T>,
    label: labels[value as ValueOf<T>],
  }));

  return (
    <Select
      options={options}
      selected={value}
      setValue={setValue}
      className={className}
    />
  );
}
