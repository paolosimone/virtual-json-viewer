import { Dispatch, useLayoutEffect, useMemo } from "react";
import { DefaultTheme, Theme } from "viewer/commons/state";
import { useStorage } from ".";

const KEY = "theme";

export function useTheme(): [Theme, Dispatch<Theme>] {
  const [theme, setTheme] = useStorage(KEY, DefaultTheme);

  // apply theme on first render
  useLayoutEffect(() => applyTheme(theme));

  // apply theme every time it's updated
  const setAndApplyTheme = useMemo(
    () => (theme: Theme) => {
      setTheme(theme);
      applyTheme(theme);
    },
    [setTheme]
  );

  return [theme, setAndApplyTheme];
}

export function useDarkThemeEnabled(): boolean {
  const [theme] = useTheme();
  return useMemo(() => darkThemeEnabled(theme), [theme]);
}

function applyTheme(theme: Theme) {
  if (darkThemeEnabled(theme)) {
    document.documentElement.classList.add(Theme.Dark);
  } else {
    document.documentElement.classList.remove(Theme.Dark);
  }
}

function darkThemeEnabled(theme: Theme): boolean {
  return (
    theme === Theme.Dark ||
    (theme === Theme.System &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}
