import { ReactNode, Ref, useImperativeHandle, useMemo } from "react";
import { MatchesResult } from "./Matcher";
import { SearchMatchHandler, renderMatches } from "./Renderer";
export type { SearchMatchHandler } from "./Renderer";

export type RenderedTextProps = Props<{
  text: string;
  matches: MatchesResult;
  ref?: Ref<RenderedTextRef>;
}>;

export type RenderedTextRef = {
  searchMatches: SearchMatchHandler[];
};

export function RenderedText({
  text,
  matches,
  ref,
}: RenderedTextProps): ReactNode {
  const { nodes, searchMatches } = useMemo(
    () => renderMatches(text, matches),
    [text, matches],
  );

  useImperativeHandle(ref, () => ({ searchMatches }), [searchMatches]);

  return nodes;
}
