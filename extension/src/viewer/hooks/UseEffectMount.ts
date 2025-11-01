import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export function useEffectMount(
  effect: MountAwareEffect,
  deps?: DependencyList,
): void {
  const isMount = useRef<boolean>(true);
  useEffect(() => {
    const cleanup = effect(isMount.current);
    isMount.current = false;
    return cleanup;
  }, deps);
}

export type MountAwareEffect = (isMount: boolean) => ReturnType<EffectCallback>;
