import { Dispatch, useLayoutEffect, useMemo } from "react";
import { SystemTheme, Theme, ThemeSetting } from "viewer/state";
import { useStorage } from ".";

const KEY = "theme";

export function useTheme(): [Theme, ThemeSetting, Dispatch<ThemeSetting>] {
  const [themeSetting, setThemeSetting] = useStorage<ThemeSetting>(
    KEY,
    SystemTheme
  );
  const theme = useMemo(() => resolveTheme(themeSetting), [themeSetting]);

  // apply theme on first render and every time it's updated
  useLayoutEffect(() => applyTheme(theme), [theme]);

  return [theme, themeSetting, setThemeSetting];
}

function resolveTheme(theme: ThemeSetting): Theme {
  const darkThemeEnabled =
    theme === Theme.Dark ||
    (theme === SystemTheme &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return darkThemeEnabled ? Theme.Dark : Theme.Light;
}

function applyTheme(theme: Theme) {
  if (theme === Theme.Dark) {
    document.documentElement.classList.add(Theme.Dark);
  } else {
    document.documentElement.classList.remove(Theme.Dark);
  }
}
