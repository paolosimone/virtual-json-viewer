import { Dispatch, useCallback, useLayoutEffect } from "react";
import {
  ResolvedTheme,
  SystemThemeName,
  Theme,
  DarkTheme,
  LightTheme,
  ThemeName,
  SystemTheme,
} from "viewer/state";
import { useMediaQuery, useStorage } from ".";

const KEY = "settings-theme";

export function useTheme(): [ResolvedTheme, Theme, Dispatch<Theme>] {
  const [theme, setTheme] = useStorage<Theme>(KEY, SystemTheme);

  const resolvedTheme = useResolvedTheme(theme);

  // apply theme on first render and every time it's updated
  useLayoutEffect(() => applyTheme(resolvedTheme), [resolvedTheme]);

  const safeSetTheme = useCallback(
    (theme: Theme) => {
      validateTheme(theme);
      setTheme(theme);
    },
    [setTheme]
  );

  return [resolvedTheme, theme, safeSetTheme];
}

function validateTheme(theme: Theme) {
  if (theme.name === ThemeName.Custom && theme.colors === null) {
    throw "Custom theme must define colors";
  }
}

function useResolvedTheme(theme: Theme): ResolvedTheme {
  const isSystemThemeDark = useMediaQuery("(prefers-color-scheme: dark)");

  if (theme.name === ThemeName.Custom) {
    return theme as ResolvedTheme;
  }

  const darkThemeEnabled =
    theme.name === ThemeName.Dark ||
    (theme.name === SystemThemeName && isSystemThemeDark);

  return darkThemeEnabled ? DarkTheme : LightTheme;
}

function applyTheme(theme: ResolvedTheme) {
  const root: Nullable<HTMLElement> = document.querySelector(":root");
  if (!root) return;

  for (const [name, rgb] of Object.entries(theme.colors)) {
    root.style.setProperty(toCssVariable(name), rgb);
  }
}

function toCssVariable(colorName: string): string {
  const hyphenName = colorName.replace(
    /[A-Z]/g,
    (capital) => `-${capital.toLowerCase()}`
  );
  return `--${hyphenName}`;
}
