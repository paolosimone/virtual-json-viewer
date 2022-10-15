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
  inputBackground: HexColor;
  inputFocus: HexColor;
  inputForeground: HexColor;
  jsonKey: HexColor;
  jsonString: HexColor;
  jsonValue: HexColor;
  toolbarBackground: HexColor;
  toolbarFocus: HexColor;
  toolbarForeground: HexColor;
  viewerBackground: HexColor;
  viewerFocus: HexColor;
  viewerForeground: HexColor;
};
export type ColorKey = keyof ThemeColors;

export const LightColors: ThemeColors = {
  inputBackground: "#ffffff",
  inputFocus: "#e5e7eb",
  inputForeground: "#000000",
  jsonKey: "#1d4fd8",
  jsonString: "#db2778",
  jsonValue: "#16a34a",
  toolbarBackground: "#f3f4f6",
  toolbarFocus: "#d5d9e0",
  toolbarForeground: "#4b5563",
  viewerBackground: "#ffffff",
  viewerFocus: "#f3f4f6",
  viewerForeground: "#000000",
};

export const DarkColors: ThemeColors = {
  inputBackground: "#d1d5db",
  inputFocus: "#adbacc",
  inputForeground: "#000000",
  jsonKey: "#60a5fa",
  jsonString: "#f472b5",
  jsonValue: "#4ade80",
  toolbarBackground: "#1f2937",
  toolbarFocus: "#4b5563",
  toolbarForeground: "#d1d5db",
  viewerBackground: "#374151",
  viewerFocus: "#4b5563",
  viewerForeground: "#e5e7eb",
};

export const DefaultTheme: Theme = {
  version: 1,
  name: ThemeName.System,
  customColors: LightColors,
};
