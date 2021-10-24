import { Dispatch, SetStateAction, useMemo, useState } from "react";

export type StateObject<S> = {
  state: S;
  setState: Dispatch<SetStateAction<S>>;
};

export function useStateObject<S>(initialState: S | (() => S)): StateObject<S> {
  const [state, setState] = useState(initialState);

  return useMemo(
    () => ({ state: state, setState: setState }),
    [state, setState]
  );
}
