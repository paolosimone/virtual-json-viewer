import { createContext } from "react";

export type Settings = {
  version: number;
  textSize: TextSize;
  indentation: number;
  searchDelay: number;
  linkifyUrls: boolean;
};

export enum TextSize {
  ExtraSmall = "XS",
  Small = "S",
  Medium = "M",
  Large = "L",
  ExtraLarge = "XL",
}

export const DefaultSettings: Settings = {
  version: 1,
  textSize: TextSize.Medium,
  indentation: 4,
  searchDelay: 300,
  linkifyUrls: true,
};

export const SettingsContext = createContext<Settings>(DefaultSettings);

/* Text Size */

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
