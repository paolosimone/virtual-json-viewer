export type Search = {
  text: string;
  showMismatch: boolean;
  caseSensitive: boolean;
};

export const EmptySearch: Search = {
  text: "",
  showMismatch: true,
  caseSensitive: false,
};
