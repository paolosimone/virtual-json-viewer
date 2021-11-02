import { createContext } from "react";

export enum Theme {
  System = "system",
  Light = "light",
  Dark = "dark",
}

export const DefaultTheme = Theme.System;

export type CurrentTheme = Theme.Light | Theme.Dark;
export const ThemeContext = createContext<CurrentTheme>(Theme.Light);
