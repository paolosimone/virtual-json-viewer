import { createContext } from "react";

export enum Theme {
  System = "system",
  Light = "light",
  Dark = "dark",
}

export const DefaultTheme = Theme.System;

export const ThemeContext = createContext(DefaultTheme);
