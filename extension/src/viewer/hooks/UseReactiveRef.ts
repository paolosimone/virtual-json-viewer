import { RefCallback, useCallback, useState } from "react";

export type RefCurrent<T> = Nullable<T>;

export function useReactiveRef<T>(): [RefCurrent<T>, RefCallback<T>] {
  const [current, setCurrent] = useState<RefCurrent<T>>(null);
  const ref = useCallback((elem: RefCurrent<T>) => {
    if (elem !== null) {
      setCurrent(elem);
    }
  }, []);
  return [current, ref];
}
