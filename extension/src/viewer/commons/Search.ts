export type Search = {
  text: string;
  showMismatch: boolean;
};

export const EmptySearch: Search = {
  text: "",
  showMismatch: true,
};
