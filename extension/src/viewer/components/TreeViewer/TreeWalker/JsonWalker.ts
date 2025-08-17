import * as Json from "@/viewer/commons/Json";
import { iterDepthFirst, LevelWalker } from "./DepthFirstWalker";

type BaseJsonWalkNode = {
  id: string;
  key: Nullable<Json.Key>;
  value: Json.Root;
  parent: Nullable<any>; // constrained below
};

export type JsonWalkRootNode = BaseJsonWalkNode & {
  parent: null;
};

export type JsonWalkChildNode<Meta> = BaseJsonWalkNode & {
  parent: JsonWalkEnrichedNode<Meta>;
};

export type JsonWalkNode<Meta> = JsonWalkRootNode | JsonWalkChildNode<Meta>;

export type JsonWalkEnrichedNode<Meta> = JsonWalkNode<Meta> & Meta;

export type JsonWalkDefaultNode = JsonWalkNode<EmptyObject>;

export function iterJson(json: Json.Root): Generator<JsonWalkDefaultNode> {
  const levelWalker = jsonLevelWalker(json) as LevelWalker<JsonWalkDefaultNode>;
  return iterDepthFirst(levelWalker);
}

export type JsonLevelWalker<Meta> = (
  parent?: JsonWalkEnrichedNode<Meta>,
) => Generator<JsonWalkNode<Meta>>;

export function jsonLevelWalker<Meta>(root: Json.Root): JsonLevelWalker<Meta> {
  return function* walkNode(parent?: JsonWalkEnrichedNode<Meta>) {
    if (parent === undefined) {
      yield* iterRoot(root);
    } else {
      yield* iterChildren(parent);
    }
  };
}

function* iterRoot(json: Json.Root): Generator<JsonWalkRootNode> {
  if (Json.isLeaf(json)) {
    yield { id: ".", key: null, value: json, parent: null };
    return;
  }

  for (const [key, value] of Json.iterator(json)) {
    yield { id: nodeId(key), key, value, parent: null };
  }
}

function* iterChildren<Meta>(
  parent: JsonWalkEnrichedNode<Meta>,
): Generator<JsonWalkChildNode<Meta>> {
  for (const [key, value] of Json.iterator(parent.value)) {
    yield { id: nodeId(key, parent.id), key, value, parent };
  }
}

function nodeId(key: Json.Key, parentId?: string): string {
  return `${parentId ?? ""}.${key}`;
}
