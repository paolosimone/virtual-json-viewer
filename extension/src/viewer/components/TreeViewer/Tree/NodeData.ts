import * as Json from "@/viewer/commons/Json";
import { Search } from "@/viewer/state";

export type NodeInput = {
  key: Nullable<Json.Key>;
  value: Json.Root;
  parent: Nullable<NodeData>;
};

export type NodeData = {
  id: string;
  key: Nullable<Json.Key>;
  value: Json.Root;
  nesting: number;
  parent: Nullable<NodeData>;
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
