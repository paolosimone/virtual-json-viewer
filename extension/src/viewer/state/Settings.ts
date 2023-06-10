import { createContext } from "react";

export type Settings = {
  version: number;

  enableJQ: boolean;
  expandNodes: boolean;
  indentation: number;
  linkifyUrls: boolean;
  searchDelay: number;
  sortKeys: boolean;
  textSize: TextSize;
};

/* Text Size */

export enum TextSize {
  ExtraSmall = "XS",
  Small = "S",
  Medium = "M",
  Large = "L",
  ExtraLarge = "XL",
}

export function resolveTextSizeClass(textSize: TextSize): string {
  return textSizeClasses[textSize];
}

const textSizeClasses: Record<TextSize, string> = {
  [TextSize.ExtraSmall]: "text-xs",
  [TextSize.Small]: "text-sm",
  [TextSize.Medium]: "text-base",
  [TextSize.Large]: "text-lg",
  [TextSize.ExtraLarge]: "text-xl",
};

/* Context */

export const DefaultSettings: Settings = {
  version: 1,

  enableJQ: true,
  expandNodes: false,
  indentation: 4,
  linkifyUrls: true,
  searchDelay: 300,
  sortKeys: true,
  textSize: TextSize.Medium,
};

export const SettingsContext = createContext<Settings>(DefaultSettings);
