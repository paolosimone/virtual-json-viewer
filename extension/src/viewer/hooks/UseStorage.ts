import { Dispatch, useContext, useEffect, useMemo, useState } from "react";
import { Runtime, RuntimeContext } from "viewer/commons/state";
import { Mutex, useEffectAsync } from ".";

export function useStorage<T>(key: string, defaultValue: T): [T, Dispatch<T>] {
  // TODO also storage sync
  const runtime = useContext(RuntimeContext);
  const storage = runtime === Runtime.Web ? LOCAL_STORAGE : LOCAL_STORAGE;

  const [value, setValue] = useState(defaultValue);

  // initialize value on first render
  useEffectAsync(
    async (mutex: Mutex) => {
      let value = await storage.get<T>(key);
      if (!mutex.hasLock()) {
        return;
      }
      if (value === null) {
        await storage.set(key, defaultValue);
        value = defaultValue;
      }
      setValue(value);
    },
    [storage, key, defaultValue]
  );

  // subscribe to external changes
  useEffect(() => storage.addListener(key, setValue), [storage, key, setValue]);

  // function to update both storage and internal state
  const setValueAndStorage = useMemo(
    () => (newValue: T) => {
      storage.set(key, newValue).then(() => setValue(newValue));
    },
    [storage, key, setValue]
  );

  return [value, setValueAndStorage];
}

type RemoveListener = () => void;

interface Storage {
  get<T>(key: string): Promise<Nullable<T>>;
  set<T>(key: string, item: T): Promise<void>;
  addListener<T>(key: string, onChange: Dispatch<T>): RemoveListener;
}

class LocalStorage implements Storage {
  get<T>(key: string): Promise<Nullable<T>> {
    return new Promise((resolve, reject) => {
      try {
        const value = localStorage.getItem(key);
        resolve(value !== null ? JSON.parse(value) : null);
      } catch (e) {
        reject(e as Error);
      }
    });
  }

  set<T>(key: string, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, JSON.stringify(item));
        resolve();
      } catch (e) {
        reject(e as Error);
      }
    });
  }

  addListener<T>(key: string, onChange: Dispatch<T>): RemoveListener {
    function listener(e: StorageEvent) {
      if (e.key === key) {
        const newValue = e.newValue !== null ? JSON.parse(e.newValue) : null;
        onChange(newValue);
      }
    }

    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }
}

const LOCAL_STORAGE = new LocalStorage();
