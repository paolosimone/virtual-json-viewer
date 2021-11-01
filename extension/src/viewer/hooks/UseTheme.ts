import { Dispatch, useLayoutEffect } from "react";
import { CurrentTheme, DefaultTheme, Theme } from "viewer/commons/state";
import { useStorage } from ".";

const KEY = "theme";

export function useTheme(): [Theme, Dispatch<Theme>] {
  const [theme, setTheme] = useStorage(KEY, DefaultTheme);
  // apply theme on first render and every time it's updated
  useLayoutEffect(() => applyTheme(theme), [theme]);
  return [theme, setTheme];
}

export function currentTheme(theme: Theme): CurrentTheme {
  const darkThemeEnabled =
    theme === Theme.Dark ||
    (theme === Theme.System &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return darkThemeEnabled ? Theme.Dark : Theme.Light;
}

function applyTheme(theme: Theme) {
  if (currentTheme(theme) === Theme.Dark) {
    document.documentElement.classList.add(Theme.Dark);
  } else {
    document.documentElement.classList.remove(Theme.Dark);
  }
}
