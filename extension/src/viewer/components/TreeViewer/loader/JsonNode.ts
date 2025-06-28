import * as Json from "@/viewer/commons/Json";
import { Search } from "@/viewer/state";

export type JsonNodeInput = {
  key: Nullable<Json.Key>;
  value: Json.Root;
  parent: Nullable<JsonNode>;
};

export type JsonNode = {
  id: string;
  key: Nullable<Json.Key>;
  value: Json.Root;
  nesting: number;
  parent: Nullable<JsonNode>;
  childrenCount: Nullable<number>;
  isLeaf: boolean;
  isOpenByDefault: boolean;
  searchMatch: Nullable<SearchMatch>;
};

export type SearchMatch = {
  search: Search;
  inKey: boolean;
  inValue: boolean;
  inAncestor: boolean;
};
