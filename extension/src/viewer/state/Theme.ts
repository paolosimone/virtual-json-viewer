import { createContext } from "react";

export type Theme = {
  version: number;
  name: ThemeSelection;
  customColors: ThemeColors;
};

// TODO replace with just ThemeColors?
export type ResolvedTheme = {
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

export type HexColor = string;

export type ThemeColors = {
  viewerBackground: HexColor;
};

export const LightTheme: ResolvedTheme = {
  name: ThemeName.Light,
  colors: {
    viewerBackground: "#BAB1DC",
  },
};

export const DarkTheme: ResolvedTheme = {
  name: ThemeName.Dark,
  colors: {
    viewerBackground: "#20C15E",
  },
};

export const DefaultTheme: Theme = {
  version: 1,
  name: SystemThemeName,
  customColors: LightTheme.colors,
};

export const ThemeContext = createContext<ResolvedTheme>(LightTheme);
