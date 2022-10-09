import { createContext } from "react";

export type Theme = {
  version: number;
  name: ThemeSelection;
  colors: Nullable<ThemeColors>;
};

export type ResolvedTheme = {
  version: number;
  name: ThemeName;
  colors: ThemeColors;
};

export enum ThemeName {
  Light = "light",
  Dark = "dark",
  Custom = "custom",
}

export const SystemThemeName = "system";
export type ThemeSelection = ThemeName | typeof SystemThemeName;

export type Rgb = string;

export type ThemeColors = {
  viewerBackground: Rgb;
};

export const LightTheme: ResolvedTheme = {
  version: 1,
  name: ThemeName.Light,
  colors: {
    viewerBackground: "14 179 96",
  },
};

export const DarkTheme: ResolvedTheme = {
  version: 1,
  name: ThemeName.Dark,
  colors: {
    viewerBackground: "14 34 179",
  },
};

export const SystemTheme: Theme = {
  version: 1,
  name: SystemThemeName,
  colors: null,
};

export const ThemeContext = createContext<ResolvedTheme>(LightTheme);
