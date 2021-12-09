import * as Json from "viewer/commons/Json";
import { Search } from "viewer/state";

export type JsonNode = {
  key: Nullable<Json.Key>;
  value: Json.Root;
  parent: Nullable<JsonNodeData>;
};

export type JsonNodeData = {
  id: string;
  isOpenByDefault: boolean;
  isLeaf: boolean;
  key: Nullable<Json.Key>;
  value: Json.Root;
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
