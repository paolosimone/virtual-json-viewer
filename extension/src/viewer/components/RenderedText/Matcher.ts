import { SearchMatch } from "./SearchedText";
export { matchLinks } from "./LinkifiedText";
export type { LinkMatch } from "./LinkifiedText";
export { matchSearch, searchMatchFromSearcher } from "./SearchedText";
export type { SearchMatch } from "./SearchedText";

import { LinkMatch } from "./LinkifiedText";

export type MatchesResult = {
  searchMatches: SearchMatch[];
  linkMatches: LinkMatch[];
};
