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
  viewerBackgroundFocus: HexColor;
  viewerKey: HexColor;
  viewerText: HexColor;
  viewerValue: HexColor;
  viewerValueString: HexColor;
};
export type ColorKey = keyof ThemeColors;

export const LightColors: ThemeColors = {
  viewerBackground: "#ffffff",
  viewerBackgroundFocus: "#ebebf0",
  viewerKey: "#1d4fd8",
  viewerText: "#000000",
  viewerValue: "#16a34a",
  viewerValueString: "#db2778",
};

export const DarkColors: ThemeColors = {
  viewerBackground: "#374151",
  viewerBackgroundFocus: "#4b5563",
  viewerKey: "#60a5fa",
  viewerText: "#e5e7eb",
  viewerValue: "#4ade80",
  viewerValueString: "#f472b5",
};

export const DefaultTheme: Theme = {
  version: 1,
  name: ThemeName.System,
  customColors: LightColors,
};
