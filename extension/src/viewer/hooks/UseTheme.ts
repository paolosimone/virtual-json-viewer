import { Dispatch, useLayoutEffect, useMemo } from "react";
import tinycolor from "tinycolor2";
import {
  DarkTheme,
  DefaultTheme,
  HexColor,
  LightTheme,
  ResolvedTheme,
  SystemThemeName,
  Theme,
  ThemeName,
} from "viewer/state";
import { useMediaQuery, useStorage } from ".";

const KEY = "settings-theme";

export function useTheme(): [ResolvedTheme, Theme, Dispatch<Theme>] {
  const [theme, setTheme] = useStorage<Theme>(KEY, DefaultTheme);

  const resolvedTheme = useResolvedTheme(theme);

  // apply theme on first render and every time it's updated
  useLayoutEffect(() => applyTheme(resolvedTheme), [resolvedTheme]);

  return [resolvedTheme, theme, setTheme];
}

function useResolvedTheme(theme: Theme): ResolvedTheme {
  const isSystemThemeDark = useMediaQuery("(prefers-color-scheme: dark)");

  return useMemo(() => {
    if (theme.name === ThemeName.Custom) {
      return { name: ThemeName.Custom, colors: theme.customColors };
    }

    const darkThemeEnabled =
      theme.name === ThemeName.Dark ||
      (theme.name === SystemThemeName && isSystemThemeDark);

    return darkThemeEnabled ? DarkTheme : LightTheme;
  }, [theme, isSystemThemeDark]);
}

function applyTheme(theme: ResolvedTheme) {
  const root: Nullable<HTMLElement> = document.querySelector(":root");
  if (!root) return;

  for (const [name, hex] of Object.entries(theme.colors)) {
    root.style.setProperty(toCssVariable(name), toCssRgb(hex));
  }
}

function toCssVariable(colorName: string): string {
  const hyphenName = colorName.replace(
    /[A-Z]/g,
    (capital) => `-${capital.toLowerCase()}`
  );
  return `--${hyphenName}`;
}

function toCssRgb(hexColor: HexColor): string {
  const rgb = tinycolor(hexColor).toRgb();
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}
