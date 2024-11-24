import { createContext } from "react";
import { ViewerMode } from "./ViewerMode";
import { EmptySearch, SearchVisibility } from "./Search";

export const SETTINGS_KEY = "settings";

export type Settings = {
  version: number;

  activationUrlRegex: Nullable<string>;
  enableJQ: boolean;
  expandNodes: boolean;
  indentation: number;
  linkifyUrls: boolean;
  searchDelay: number;
  searchVisibility: SearchVisibility;
  sortKeys: boolean;
  textSize: TextSize;
  viewerMode: ViewerMode;
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

  activationUrlRegex: null,
  enableJQ: true,
  expandNodes: false,
  indentation: 4,
  linkifyUrls: true,
  searchDelay: 300,
  searchVisibility: EmptySearch.visibility,
  sortKeys: true,
  textSize: TextSize.Medium,
  viewerMode: ViewerMode.Tree,
};

export const SettingsContext = createContext<Settings>(DefaultSettings);
