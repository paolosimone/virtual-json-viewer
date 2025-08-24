import { useEffect, useState } from "react";
import { RefCurrent } from "./UseReactiveRef";

export function useFocus<E extends HTMLElement>(
  element: RefCurrent<E>,
): boolean {
  const [hasFocus, setHasFocus] = useState(false);
  useEffect(() => {
    element?.addEventListener("focus", () => setHasFocus(true));
    element?.addEventListener("blur", () => setHasFocus(false));
  }, [element]);
  return hasFocus;
}
