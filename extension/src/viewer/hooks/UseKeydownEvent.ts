import React, { useEffect, useMemo } from "react";

export type KeydownEvent = KeyboardEvent | React.KeyboardEvent;
export type OnKeydown = (e: KeydownEvent) => void;

export function useGlobalKeydownEvent(onKeydown: OnKeydown): void {
  useEffect(() => {
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [onKeydown]);
}

export type KeydownBufferEvent = {
  last: KeydownEvent;
  buffer: KeydownEvent[];
  text: string;
};
export type OnKeydownBuffer = (e: KeydownBufferEvent) => void;

export type UseKeydownBufferArgs = {
  bufferSize: number;
  keypressDelay: number;
};

export function useKeydownBuffer(
  onKeydownBuffer: OnKeydownBuffer,
  { bufferSize, keypressDelay }: UseKeydownBufferArgs
): OnKeydown {
  return useMemo(() => {
    let buffer: KeydownEvent[] = [];
    let lastKeypress = 0;

    return (e: KeydownEvent) => {
      const now = Date.now();

      if (now - lastKeypress > keypressDelay) {
        buffer = [];
      }

      if (buffer.length == bufferSize) {
        // O(N) but in this use case N should be really small
        buffer.shift();
      }

      buffer.push(e);
      lastKeypress = now;

      onKeydownBuffer({
        last: e,
        buffer: [...buffer],
        text: buffer.map((e) => e.key).join(""),
      });
    };
  }, [onKeydownBuffer, bufferSize, keypressDelay]);
}

// performs a double check because one works on windows and one on macos
// even if I have no idea why (god I hate frontends)
export function isUpperCaseKeypress(e: KeydownEvent, letter: string): boolean {
  return (
    e.key == letter.toUpperCase() ||
    (e.shiftKey && e.key == letter.toLowerCase())
  );
}

export const CHORD_KEY = isMacOs() ? "metaKey" : "ctrlKey";

function isMacOs(): boolean {
  const platform: string =
    // @ts-expect-error: navigator.userAgentData is not yet included in typescript
    navigator?.userAgentData?.platform ?? navigator?.platform ?? "unknown";

  return platform.toLowerCase().includes("mac");
}
