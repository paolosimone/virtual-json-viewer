import { RefObject, useEffect, useState } from "react";

// The element size, without padding
export type Size = {
  height: number;
  width: number;
};

export function useElementSize<T extends Element>(
  element: RefObject<T>,
  delay?: number
): Size {
  const [size, updateSize] = useState<Size>(currentSize(element));

  useEffect(() => {
    if (!element.current) {
      return;
    }

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
    observer.observe(element.current);

    // unsubscribe on exit
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [element.current, delay, updateSize]);

  return size;
}

function currentSize<T extends Element>(element: RefObject<T>): Size {
  if (!element.current) {
    return { height: 0, width: 0 };
  }

  const style = window.getComputedStyle(element.current);
  const paddingY =
    parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const paddingX =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

  return {
    height: element.current.clientHeight - paddingY,
    width: element.current.clientWidth - paddingX,
  };
}
