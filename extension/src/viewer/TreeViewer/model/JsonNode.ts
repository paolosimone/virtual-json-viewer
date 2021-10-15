export type JsonNode = {
  key: string;
  value: Json;
  parent: Nullable<JsonNodeData>;
};

export type JsonNodeData = {
  id: string;
  isOpenByDefault: boolean;
  isLeaf: boolean;
  key: Nullable<string>;
  value: Json;
  nesting: number;
  childrenCount: Nullable<number>;
  parent: Nullable<JsonNodeData>;
  defaultHeight: number;
  searchMatch: Nullable<SearchMatch>;
};

export type SearchMatch = {
  inKey: boolean;
  inValue: boolean;
  inAncestor: boolean;
};
