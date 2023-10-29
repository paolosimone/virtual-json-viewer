import { Dispatch, SetStateAction, useMemo, useState } from "react";

export type StateObject<S> = {
  value: S;
  setValue: Dispatch<SetStateAction<S>>;
};

export function useStateObject<S>(initialState: S | (() => S)): StateObject<S> {
  const state = useState(initialState);
  return useStateObjectAdapter(state);
}

export function useStateObjectAdapter<S>([value, setValue]: [
  S,
  Dispatch<SetStateAction<S>>,
]): StateObject<S> {
  return useMemo(() => ({ value, setValue }), [value, setValue]);
}
