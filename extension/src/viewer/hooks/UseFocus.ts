import { useEffect, useState } from "react";
import { RefCurrent } from "./UseReactiveRef";

export function useFocus<E extends HTMLElement>(
  element: RefCurrent<E>,
): boolean {
  const [hasFocus, setHasFocus] = useState(false);
  useEffect(() => {
    if (!element) return;
    const focus = () => setHasFocus(true);
    const blur = () => setHasFocus(false);
    element.addEventListener("focus", focus);
    element.addEventListener("blur", blur);
    return () => {
      element.removeEventListener("focus", focus);
      element.removeEventListener("blur", blur);
    };
  }, [element]);
  return hasFocus;
}
