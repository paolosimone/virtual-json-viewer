import { useEffect, useState } from "react";
import { RefCurrent } from "./UseReactiveRef";

export function useHover<E extends HTMLElement>(
  element: RefCurrent<E>,
): boolean {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!element) return;
    const hover = () => setIsHovered(true);
    const leave = () => setIsHovered(false);
    element.addEventListener("mouseenter", hover);
    element.addEventListener("mouseleave", leave);
    return () => {
      element.removeEventListener("mouseenter", hover);
      element.removeEventListener("mouseleave", leave);
    };
  }, [element]);

  // JS misses events when moving the mouse too fast,
  // so we have to ask the window if the element is still hovered.
  // Ref: https://stackoverflow.com/questions/63222336
  useEffect(() => {
    if (!element || !isHovered) return;
    const checkHover = (e: MouseEvent) => {
      if (!element.contains(e.target as Node)) {
        setIsHovered(false);
      }
    };
    window.addEventListener("mousemove", checkHover);
    return () => window.removeEventListener("mousemove", checkHover);
  }, [isHovered, element]);

  return isHovered;
}
