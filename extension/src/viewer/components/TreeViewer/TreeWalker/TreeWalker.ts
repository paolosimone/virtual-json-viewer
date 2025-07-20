import * as Json from "@/viewer/commons/Json";
import { Search } from "@/viewer/state";
import { TreeSearch } from "./TreeSearch";
import { SearchMatch, WalkedNode, WalkNodeInput } from "./WalkNode";

export type TreeWalker = () => Generator<WalkedNode>;

export function treeWalker(
  json: Json.Root,
  search: Search,
  expandNodes: boolean,
): TreeWalker {
  const buildNode = nodeDataBuilder(expandNodes);
  const levelWalker = search.text
    ? filteredJsonWalker(json, buildNode, search)
    : fullJsonWalker(json, buildNode);
  return () => walkTree(levelWalker);
}

type TreeLevelWalker = (parent?: WalkedNode) => Generator<WalkedNode>;

function* walkTree(levelWalker: TreeLevelWalker): Generator<WalkedNode> {
  // Start from root level
  const stack = [levelWalker()];

  // Depth first traversal
  while (stack.length) {
    const level = stack[stack.length - 1].next();

    // This level of the tree was fully walked
    if (level.done) {
      stack.pop();
      continue;
    }

    const node = level.value;

    yield node;

    stack.push(levelWalker(node));
  }
}

function fullJsonWalker(
  root: Json.Root,
  buildNode: NodeDataBuilder,
): TreeLevelWalker {
  function* walkRoot() {
    for (const input of getRootInputs(root)) {
      yield buildNode(input);
    }
  }

  return function* walkNode(parent?: WalkedNode) {
    if (parent === undefined) {
      yield* walkRoot();
      return;
    }

    for (const [key, value] of Json.iterator(parent.value)) {
      yield buildNode({ key, value, parent });
    }
  };
}

function filteredJsonWalker(
  root: Json.Root,
  buildNode: NodeDataBuilder,
  search: Search,
): TreeLevelWalker {
  const filter = new TreeSearch(search);

  function* walkRoot() {
    let existsMatch = false;

    for (const input of getRootInputs(root)) {
      const match = filter.match(input);
      if (match) {
        existsMatch = true;
        yield buildNode(input, match);
      }
    }

    if (!existsMatch) {
      yield buildNode(NOT_FOUND_PLACEHOLDER);
    }
  }

  return function* walkNode(parent?: WalkedNode) {
    if (parent === undefined) {
      yield* walkRoot();
      return;
    }

    for (const [key, value] of Json.iterator(parent.value)) {
      const input = { key, value, parent };
      const match = filter.match(input);
      if (match) {
        yield buildNode(input, match);
      }
    }
  };
}

function getRootInputs(json: Json.Root): WalkNodeInput[] {
  if (Json.isLeaf(json)) {
    return [{ key: null, value: json, parent: null }];
  }

  return [...Json.iterator(json as Json.Collection)].map(([key, value]) => ({
    key: key,
    value: value,
    parent: null,
  }));
}

function buildId(
  key: Nullable<Json.Key>,
  parent: Nullable<WalkedNode>,
): string {
  return `${parent?.id ?? ""}.${key ?? ""}`;
}

type NodeDataBuilder = (
  input: WalkNodeInput,
  searchMatch?: Nullable<SearchMatch>,
) => WalkedNode;

function nodeDataBuilder(expandNodes: boolean): NodeDataBuilder {
  function isOpenByDefault(
    value: Json.Root,
    searchMatch: Nullable<SearchMatch>,
  ) {
    // leaves don't have children so they are always "closed"
    if (Json.isLeaf(value)) {
      return false;
    }

    // if search is enabled, open it only if children contain a search match
    if (searchMatch) {
      return searchMatch.inValue;
    }

    // default behavior
    return expandNodes;
  }

  return function buildNode(
    { key, value, parent }: WalkNodeInput,
    searchMatch: Nullable<SearchMatch> = null,
  ): WalkedNode {
    return {
      id: buildId(key, parent),
      key,
      value,
      parent,
      isOpenByDefault: isOpenByDefault(value, searchMatch),
      searchMatch,
    };
  };
}

const NOT_FOUND_PLACEHOLDER: WalkNodeInput = {
  key: null,
  value: null,
  parent: null,
};
