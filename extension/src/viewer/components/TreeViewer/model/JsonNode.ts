import { Search } from "viewer/commons/state";

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
  search: Search;
  inKey: boolean;
  inValue: boolean;
  inAncestor: boolean;
};
