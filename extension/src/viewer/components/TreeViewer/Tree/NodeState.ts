import * as Json from "@/viewer/commons/Json";
import { SearchMatch } from "../TreeWalker";
export type { SearchMatch } from "../TreeWalker";

export type NodeId = number;

export type NodeWalkId = string;

export type NodeState = {
  id: NodeId;
  walkId: NodeWalkId;
  key: Nullable<Json.Key>;
  value: Json.Root;
  nesting: number;
  parent: Nullable<NodeState>;
  children: NodeState[];
  sibling: Nullable<NodeState>;
  isLeaf: boolean;
  isOpen: boolean;
  searchMatch: Nullable<SearchMatch>;
};
