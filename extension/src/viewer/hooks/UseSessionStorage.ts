import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useSessionStorage<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [wasInSession] = useState(() => getItem(key) !== null);
  const [value, setValue] = useState<T>(() => getItem(key) ?? defaultValue);
  useEffect(() => setItem(key, value), [key, value]);
  return [value, setValue, wasInSession];
}

function setItem<T>(key: string, item: T) {
  try {
    sessionStorage.setItem(key, JSON.stringify(item));
  } catch {
    console.warn("Unable to access session storage");
  }
}

function getItem<T>(key: string): Nullable<T> {
  try {
    const item = sessionStorage.getItem(key) ?? "null";
    return JSON.parse(item);
  } catch {
    console.warn("Unable to access session storage");
    return null;
  }
}
