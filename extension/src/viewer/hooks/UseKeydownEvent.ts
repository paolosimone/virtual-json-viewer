import { RefObject, useEffect } from "react";

export type OnKeydown = (e: KeyboardEvent) => void;

export function useKeydownEvent(
  onKeydown: OnKeydown,
  ref: Nullable<RefObject<HTMLElement>> = null
): void {
  const elem: Nullable<GlobalEventHandlers> = ref ? ref.current : document;

  useEffect(() => {
    elem?.addEventListener("keydown", onKeydown);
    return () => elem?.removeEventListener("keydown", onKeydown);
  }, [elem]);
}

export const CHORD_KEY = isMacOs() ? "metaKey" : "ctrlKey";

function isMacOs(): boolean {
  const platform: string =
    // @ts-expect-error: navigator.userAgentData is not yet included in typescript
    navigator?.userAgentData?.platform ?? navigator?.platform ?? "unknown";

  return platform.toLowerCase().includes("mac");
}
