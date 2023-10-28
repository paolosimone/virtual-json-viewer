import { Dispatch, useLayoutEffect, useMemo } from "react";
import tinycolor from "tinycolor2";
import {
  ColorKey,
  DarkColors,
  DefaultTheme,
  HexColor,
  LightColors,
  Theme,
  ThemeColors,
  ThemeName,
} from "viewer/state";
import { useMediaQuery, useStorage } from ".";

const KEY = "settings-theme";

export function useTheme(): [ThemeColors, Theme, Dispatch<Theme>] {
  const [theme, setTheme] = useStorage<Theme>(KEY, DefaultTheme);

  const resolvedTheme = useResolvedTheme(theme);

  // apply theme on first render and every time it's updated
  useLayoutEffect(() => applyTheme(resolvedTheme), [resolvedTheme]);

  return [resolvedTheme, theme, setTheme];
}

function useResolvedTheme(theme: Theme): ThemeColors {
  const isSystemThemeDark = useMediaQuery("(prefers-color-scheme: dark)");

  return useMemo(() => {
    if (theme.name === ThemeName.Custom) {
      return theme.customColors;
    }

    const darkThemeEnabled =
      theme.name === ThemeName.Dark ||
      (theme.name === ThemeName.System && isSystemThemeDark);

    return darkThemeEnabled ? DarkColors : LightColors;
  }, [theme, isSystemThemeDark]);
}

function applyTheme(colors: ThemeColors) {
  const root: Nullable<HTMLElement> = document.querySelector(":root");
  if (!root) return;

  for (const [key, hex] of Object.entries(colors)) {
    root.style.setProperty(toCssVariable(key as ColorKey), toTailwindRgb(hex));
  }
}

function toCssVariable(colorKey: ColorKey): string {
  const hyphenName = colorKey.replace(
    /[A-Z]/g,
    (capital) => `-${capital.toLowerCase()}`,
  );
  return `--${hyphenName}`;
}

function toTailwindRgb(hexColor: HexColor): string {
  const rgb = tinycolor(hexColor).toRgb();
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}
