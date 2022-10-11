export type Theme = {
  version: number;
  name: ThemeName;
  customColors: ThemeColors;
};

export enum ThemeName {
  Custom = "custom",
  Dark = "dark",
  Light = "light",
  System = "system",
}

export type HexColor = string;

export type ThemeColors = {
  viewerBackground: HexColor;
};
export type ColorKey = keyof ThemeColors;

export const LightColors: ThemeColors = {
  viewerBackground: "#BAB1DC",
};

export const DarkColors: ThemeColors = {
  viewerBackground: "#20C15E",
};

export const DefaultTheme: Theme = {
  version: 1,
  name: ThemeName.System,
  customColors: LightColors,
};
