import { useEffect, useState } from "react";
import { RefCurrent } from "./UseReactiveRef";

// The element size, without padding
export type Size = {
  height: number;
  width: number;
};

export function useElementSize<T extends Element>(
  element: RefCurrent<T>,
  delay?: number
): Size {
  const [size, updateSize] = useState<Size>(currentSize(element));

  useEffect(() => {
    if (!element) return;

    // update size on first render
    updateSize(currentSize(element));

    // throttle resize triggers
    let timeoutId: NodeJS.Timeout | null = null;
    const onResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => updateSize(currentSize(element)), delay);
    };

    // subscribe to resize events
    const observer = new ResizeObserver(onResize);
    observer.observe(element);

    // unsubscribe on exit
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [element, delay, updateSize]);

  return size;
}

function currentSize<T extends Element>(element: RefCurrent<T>): Size {
  if (!element) {
    return { height: 0, width: 0 };
  }

  const style = window.getComputedStyle(element);
  const paddingY =
    parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const paddingX =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

  return {
    height: element.clientHeight - paddingY,
    width: element.clientWidth - paddingX,
  };
}
