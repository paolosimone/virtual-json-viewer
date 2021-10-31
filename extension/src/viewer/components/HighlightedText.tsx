import { createElement, ReactNode } from "react";
import { uid } from "uid";

export type HighlightedTextProps = Props<{
  text: string;
  selection: string;
  caseSensitive?: boolean;
}>;

export function HighlightedText({
  text,
  selection,
  caseSensitive,
}: HighlightedTextProps): ReactNode[] {
  const flags = caseSensitive ? undefined : "i";
  const separator = new RegExp(`(${escapeRegExp(selection)})`, flags);

  // the separator is included in the split array as odd-index elements
  return text.split(separator).map((token, index) => {
    const type = index % 2 ? "mark" : "span";
    const key = `${index}-${uid()}`;
    return createElement(type, { key: key }, token);
  });
}

// Source:  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
