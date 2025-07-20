export type Search = {
  text: string;
  visibility: SearchVisibility;
  caseSensitive: boolean;
};

export enum SearchVisibility {
  All = "all",
  Subtree = "subtree",
  Match = "match",
}

export const EmptySearch: Search = {
  text: "",
  visibility: SearchVisibility.Subtree,
  caseSensitive: false,
};

// Navigation

export type SearchNavigation = {
  currentIndex: Nullable<number>;
  totalCount: Nullable<number>;
};

export const EmptySearchNavigation: SearchNavigation = {
  currentIndex: null,
  totalCount: null,
};
