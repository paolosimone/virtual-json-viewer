import * as Json from "@/viewer/commons/Json";
import { Search } from "@/viewer/state";

export type WalkNodeInput = {
  key: Nullable<Json.Key>;
  value: Json.Root;
  parent: Nullable<WalkedNode>;
};

export type WalkedNode = {
  id: string;
  key: Nullable<Json.Key>;
  value: Json.Root;
  parent: Nullable<WalkedNode>;
  isOpenByDefault: boolean;
  searchMatch: Nullable<SearchMatch>;
};

export type SearchMatch = {
  search: Search;
  inKey: boolean;
  inValue: boolean;
  inAncestor: boolean;
};
