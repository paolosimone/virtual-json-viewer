export enum SearchVisibility {
  All = "all",
  Subtree = "subtree",
  Match = "match",
}

export type Search = {
  text: string;
  visibility: SearchVisibility;
  caseSensitive: boolean;
};

export const EmptySearch: Search = {
  text: "",
  visibility: SearchVisibility.Subtree,
  caseSensitive: false,
};
