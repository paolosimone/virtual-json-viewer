import { useEffect, useState } from "react";

export type WindowSize = {
  height: number;
  width: number;
};

export function useWindowSize(delay: number): WindowSize {
  const [windowSize, updateSize] = useState<WindowSize>(currentWindowSize);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const onResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => updateSize(currentWindowSize()), delay);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [updateSize, delay]);

  return windowSize;
}

function currentWindowSize(): WindowSize {
  return {
    height: window.innerHeight,
    width: window.innerWidth,
  };
}
