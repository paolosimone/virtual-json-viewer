import { useCallback, useLayoutEffect, useState } from "react";
import { RefCurrent } from "./UseReactiveRef";

// The element size, without padding
export type Size = {
  height: number;
  width: number;
};

export function useElementSize<T extends Element>(
  element: RefCurrent<T>
): Size {
  const [size, setSize] = useState<Size>(currentSize(element));

  const updateSize = useCallback(() => {
    const newSize = currentSize(element);
    // prevent useless re-render if size has not actually changed
    setSize((oldSize) => (isSameSize(oldSize, newSize) ? oldSize : newSize));
  }, [element, setSize]);

  useLayoutEffect(() => {
    if (!element) return;

    // update size on first render
    updateSize();

    // subscribe to resize events
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    // unsubscribe on exit
    return () => observer.disconnect();
  }, [element, updateSize]);

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

function isSameSize(left: Size, right: Size): boolean {
  return left.height == right.height && left.width == right.width;
}
