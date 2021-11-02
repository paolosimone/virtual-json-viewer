import { Dispatch, useContext, useEffect, useMemo, useState } from "react";
import { Runtime, RuntimeContext } from "viewer/state";
import { Mutex, useEffectAsync } from ".";

export function useStorage<T>(key: string, defaultValue: T): [T, Dispatch<T>] {
  const runtime = useContext(RuntimeContext);
  const storage = runtime === Runtime.Extension ? SYNC_STORAGE : LOCAL_STORAGE;

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
        reject(e);
      }
    });
  }

  set<T>(key: string, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, JSON.stringify(item));
        resolve();
      } catch (e) {
        reject(e);
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

class SyncStorage implements Storage {
  get<T>(key: string): Promise<Nullable<T>> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(key, (items) => resolve(items[key] ?? null));
      } catch (e) {
        reject(e);
      }
    });
  }

  set<T>(key: string, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.set({ [key]: item }, resolve);
      } catch (e) {
        reject(e);
      }
    });
  }

  addListener<T>(key: string, onChange: Dispatch<T>): RemoveListener {
    function listener(changes: { [key: string]: any }) {
      if (key in changes) {
        onChange(changes[key].newValue);
      }
    }

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
}

const SYNC_STORAGE = new SyncStorage();
