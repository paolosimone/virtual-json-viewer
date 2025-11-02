import { getStorage } from "@/viewer/commons/Storage";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { Mutex, useEffectAsync } from ".";

export function useStorage<T>(
  key: string,
  defaultValue: T,
): [Nullable<T>, Dispatch<T>] {
  const [value, setValue] = useState<Nullable<T>>(null);
  const [storage] = useState(() => getStorage());

  // initialize value on first render
  useEffectAsync(
    async (mutex: Mutex) => {
      let value: Nullable<T> = await storage.get<T>(key);
      if (!mutex.hasLock()) {
        return;
      }
      if (value === null) {
        await storage.set(key, defaultValue);
        value = defaultValue;
      }
      setValue(value);
    },
    [storage, key, defaultValue],
  );

  // subscribe to external changes
  useEffect(() => storage.addListener(key, setValue), [storage, key, setValue]);

  // function to update both storage and internal state
  const setValueAndStorage = useCallback(
    (newValue: T) => {
      storage.set(key, newValue).then(() => setValue(newValue));
    },
    [storage, key],
  );

  return [value, setValueAndStorage];
}
