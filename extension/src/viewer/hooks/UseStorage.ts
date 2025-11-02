import { STORAGE } from "@/viewer/commons/Storage";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { Mutex, useEffectAsync } from ".";

export function useStorage<T>(
  key: string,
  defaultValue: T,
): [Nullable<T>, Dispatch<T>] {
  const [value, setValue] = useState<Nullable<T>>(null);

  // initialize value on first render
  useEffectAsync(
    async (mutex: Mutex) => {
      let value: Nullable<T> = await STORAGE.get<T>(key);
      if (!mutex.hasLock()) {
        return;
      }
      if (value === null) {
        await STORAGE.set(key, defaultValue);
        value = defaultValue;
      }
      setValue(value);
    },
    [key, defaultValue],
  );

  // subscribe to external changes
  useEffect(() => STORAGE.addListener(key, setValue), [key, setValue]);

  // function to update both storage and internal state
  const setValueAndStorage = useCallback(
    (newValue: T) => {
      STORAGE.set(key, newValue).then(() => setValue(newValue));
    },
    [key],
  );

  return [value, setValueAndStorage];
}
