import * as Json from "@/viewer/commons/Json";
import { Search } from "@/viewer/state";
import {
  DepthFirstWalker,
  iterDepthFirst,
  LevelWalker,
} from "./DepthFirstWalker";
import {
  jsonLevelWalker,
  JsonWalkEnrichedNode,
  JsonWalkNode,
  JsonWalkRootNode,
} from "./JsonWalker";
import { NodeSearchMatch, TreeSearch } from "./TreeSearch";
export type { NodeSearchMatch } from "./TreeSearch";

type WalkMeta = {
  isOpenByDefault: boolean;
  searchMatch: Nullable<NodeSearchMatch>;
};

export type WalkedNode = JsonWalkEnrichedNode<WalkMeta>;

export type TreeWalker = DepthFirstWalker<WalkedNode>;

export function treeWalker(
  json: Json.Root,
  search: Search,
  expandNodes: boolean,
): TreeWalker {
  const buildNode = nodeDataBuilder(expandNodes);
  const levelWalker = search.text
    ? filteredWalker(json, buildNode, search)
    : fullWalker(json, buildNode);
  return () => iterDepthFirst(levelWalker);
}

type TreeLevelWalker = LevelWalker<WalkedNode>;

function fullWalker(
  json: Json.Root,
  buildNode: NodeDataBuilder,
): TreeLevelWalker {
  const levelWalker = jsonLevelWalker<WalkMeta>(json);

  return function* walkNode(parent?: WalkedNode) {
    for (const node of levelWalker(parent)) {
      yield buildNode(node);
    }
  };
}

function filteredWalker(
  json: Json.Root,
  buildNode: NodeDataBuilder,
  search: Search,
): TreeLevelWalker {
  const levelWalker = jsonLevelWalker<WalkMeta>(json);
  const filter = new TreeSearch(json, search);

  return function* walkNode(parent?: WalkedNode) {
    let showPlaceholder = parent === undefined;

    for (const node of levelWalker(parent)) {
      const match = filter.getMatch(node.id);
      if (match) {
        showPlaceholder = false;
        yield buildNode(node, match);
      }
    }

    if (showPlaceholder) {
      yield buildNode(NOT_FOUND_PLACEHOLDER);
    }
  };
}

type NodeDataBuilder = (
  input: JsonWalkNode<WalkMeta>,
  searchMatch?: Nullable<NodeSearchMatch>,
) => WalkedNode;

function nodeDataBuilder(expandNodes: boolean): NodeDataBuilder {
  function isOpenByDefault(
    value: Json.Root,
    searchMatch: Nullable<NodeSearchMatch>,
  ) {
    // leaves don't have children so they are always "closed"
    if (Json.isLeaf(value)) {
      return false;
    }

    // if search is enabled, open it only if descendants contain a search match
    if (searchMatch) {
      return searchMatch.inDescendant;
    }

    // default behavior
    return expandNodes;
  }

  return function buildNode(
    { id, key, value, parent }: JsonWalkNode<WalkMeta>,
    searchMatch: Nullable<NodeSearchMatch> = null,
  ): WalkedNode {
    return {
      id,
      key,
      value,
      parent,
      isOpenByDefault: isOpenByDefault(value, searchMatch),
      searchMatch,
    };
  };
}

const NOT_FOUND_PLACEHOLDER: JsonWalkRootNode = {
  id: ".",
  key: null,
  value: null,
  parent: null,
};
