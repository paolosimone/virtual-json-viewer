import { Dispatch, SetStateAction, useMemo, useState } from "react";

export type SetValue<S> = Dispatch<SetStateAction<S>>;

export type StateObject<S> = {
  value: S;
  setValue: SetValue<S>;
};

export function useStateObject<S>(initialState: S | (() => S)): StateObject<S> {
  const state = useState(initialState);
  return useStateObjectAdapter(state);
}

export function useStateObjectAdapter<S>([value, setValue]: [
  S,
  SetValue<S>,
]): StateObject<S> {
  return useMemo(() => ({ value, setValue }), [value, setValue]);
}

export function updateField<S>(
  key: keyof S,
  value: S[keyof S],
): (current: S) => S {
  return (current) =>
    Object.is(current[key], value) ? current : { ...current, [key]: value };
}
