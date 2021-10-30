import { Dispatch, SetStateAction, useMemo, useState } from "react";

export type StateObject<S> = {
  value: S;
  setValue: Dispatch<SetStateAction<S>>;
};

export function useStateObject<S>(initialState: S | (() => S)): StateObject<S> {
  const [value, setValue] = useState(initialState);

  return useMemo(
    () => ({ value: value, setValue: setValue }),
    [value, setValue]
  );
}
