import { useEffect } from "react";

export type OnKeydown = (e: KeyboardEvent) => void;

export function useGlobalKeydownEvent(onKeydown: OnKeydown): void {
  useEffect(() => {
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [onKeydown]);
}

export const CHORD_KEY = isMacOs() ? "metaKey" : "ctrlKey";

function isMacOs(): boolean {
  const platform: string =
    // @ts-expect-error: navigator.userAgentData is not yet included in typescript
    navigator?.userAgentData?.platform ?? navigator?.platform ?? "unknown";

  return platform.toLowerCase().includes("mac");
}
