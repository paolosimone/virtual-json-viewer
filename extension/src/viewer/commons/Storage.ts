import { Runtime, RUNTIME } from "@/viewer/state";

export type RemoveListener = () => void;
export type OnItemChange<T> = (item: T) => void;

export interface Storage {
  get<T>(key: string): Promise<Nullable<T>>;
  set<T>(key: string, item: T): Promise<void>;
  addListener<T>(key: string, onChange: OnItemChange<T>): RemoveListener;
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

  addListener<T>(key: string, onChange: OnItemChange<T>): RemoveListener {
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

  addListener<T>(key: string, onChange: OnItemChange<T>): RemoveListener {
    function listener(changes: { [key: string]: any }) {
      if (key in changes) {
        onChange(changes[key].newValue);
      }
    }

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
}

function getStorage(): Storage {
  return RUNTIME === Runtime.Extension ? new SyncStorage() : new LocalStorage();
}

export const STORAGE = getStorage();
