import { Dispatch, useEffect, useMemo, useState } from "react";

export function useStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, Dispatch<T>] {
  // TODO also storage sync
  // const runtime = useContext(RuntimeContext)
  // console.log(runtime);

  const [value, setValue] = useState<T>(() => {
    let value = getStorageItem<T>(key);
    if (value === null) {
      value = initialValue instanceof Function ? initialValue() : initialValue;
      setStorageItem(key, value);
    }
    return value;
  });

  // subscribe to external changes
  useEffect(() => {
    function updateValue(e: StorageEvent) {
      if (e.key === key && e.newValue !== null) {
        setValue(JSON.parse(e.newValue));
      }
    }
    window.addEventListener("storage", updateValue);
    return window.removeEventListener("storage", updateValue);
  }, [key, setValue]);

  const setValueAndStorage = useMemo(
    () => (newValue: T) => {
      setStorageItem(key, newValue);
      setValue(newValue);
    },
    [key, setValue]
  );

  return [value, setValueAndStorage];
}

function getStorageItem<T>(key: string): Nullable<T> {
  const value = localStorage.getItem(key);
  return value !== null ? JSON.parse(value) : null;
}

function setStorageItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
