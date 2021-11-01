import { DependencyList, useEffect } from "react";

export function useEffectAsync(
  effectAsync: SynchronizedEffect,
  deps?: DependencyList
) {
  useEffect(
    () => {
      // acquire lock
      let mutex = new Mutex();

      // apply effects only if mutex.hasLock()
      effectAsync(mutex);

      // release lock when deps change
      return mutex.release;
    },
    // eslint-disable-next-line
    deps ?? []
  );
}

export type SynchronizedEffect = (mutex: Mutex) => Promise<void>;

// we need an object to be passed by reference
export class Mutex {
  lock: boolean;

  public constructor() {
    this.lock = true;
  }

  public hasLock(): boolean {
    return this.lock;
  }

  public release() {
    this.lock = false;
  }
}