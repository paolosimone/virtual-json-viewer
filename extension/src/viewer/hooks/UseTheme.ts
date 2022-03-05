import { Dispatch, useLayoutEffect } from "react";
import { SystemTheme, Theme, ThemeSetting } from "viewer/state";
import { useMediaQuery, useStorage } from ".";

const KEY = "theme";

export function useTheme(): [Theme, ThemeSetting, Dispatch<ThemeSetting>] {
  const [themeSetting, setThemeSetting] = useStorage<ThemeSetting>(
    KEY,
    SystemTheme
  );

  const theme = useResolvedTheme(themeSetting);

  // apply theme on first render and every time it's updated
  useLayoutEffect(() => applyTheme(theme), [theme]);

  return [theme, themeSetting, setThemeSetting];
}

function useResolvedTheme(theme: ThemeSetting): Theme {
  const isSystemThemeDark = useMediaQuery("(prefers-color-scheme: dark)");

  const darkThemeEnabled =
    theme === Theme.Dark || (theme === SystemTheme && isSystemThemeDark);

  return darkThemeEnabled ? Theme.Dark : Theme.Light;
}

function applyTheme(theme: Theme) {
  if (theme === Theme.Dark) {
    document.documentElement.classList.add(Theme.Dark);
  } else {
    document.documentElement.classList.remove(Theme.Dark);
  }
}
