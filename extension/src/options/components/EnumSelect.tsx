import { Select } from "@/viewer/components";
import { Dispatch, JSX } from "react";

export type EnumSelectProps<T extends StringEnumType> = Props<{
  enumType: T;
  labels: Record<ValueOf<T>, string>;
  value: ValueOf<T>;
  setValue: Dispatch<ValueOf<T>>;
}>;

export function EnumSelect<T extends StringEnumType>({
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
