export type JQCommand = {
  filter: string;
  // Only present if the input has multiple JSON lines
  slurp: Nullable<boolean>;
};

export const EmptyJQCommand: JQCommand = {
  filter: "",
  slurp: null,
};
