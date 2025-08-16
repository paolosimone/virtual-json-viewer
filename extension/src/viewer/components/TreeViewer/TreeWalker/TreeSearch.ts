import * as Json from "@/viewer/commons/Json";
import { buildSearcher, SearchMatchRange } from "@/viewer/commons/Searcher";
import { Search, SearchVisibility } from "@/viewer/state";
import { iterJson, JsonWalkDefaultNode } from "./JsonWalker";

export type NodeSearchMatch = {
  keyMatches: SearchMatchRange[];
  valueMatches: SearchMatchRange[];
  inKey: boolean;
  inValue: boolean;
  inAncestor: boolean;
  inDescendant: boolean;
};

export class TreeSearch {
  private searchMatches: Map<string, NodeSearchMatch> = new Map();
  private keepStrategy: KeepStrategy;

  constructor(tree: Json.Root, search: Search) {
    if (!search.text) {
      throw new Error("Search query is empty");
    }

    this.searchMatches = findSearchMatches(tree, search);
    this.keepStrategy = buildKeepStrategy(search);
  }

  public getMatch(nodeId: string): Nullable<NodeSearchMatch> {
    const searchMatch = this.searchMatches.get(nodeId)!;
    return this.keepStrategy.keep(searchMatch) ? searchMatch : null;
  }
}

// #Nodes + #Matches * TreeHeight ~ O(N * log(N))
function findSearchMatches(
  tree: Json.Root,
  search: Search,
): Map<string, NodeSearchMatch> {
  const buildSearchMatch = searchMatchBuilder(search);

  const searchMatches = new Map<string, NodeSearchMatch>();
  for (const node of iterJson(tree)) {
    const parentMatch = node.parent
      ? searchMatches.get(node.parent.id)!
      : undefined;

    const searchMatch = buildSearchMatch(node, parentMatch);

    if (searchMatch.inKey || searchMatch.inValue) {
      notifyMatchToAncestors(searchMatches, node);
    }

    searchMatches.set(node.id, searchMatch);
  }
  return searchMatches;
}

type SearchMatchBuilder = (
  node: JsonWalkDefaultNode,
  parentMatch?: NodeSearchMatch,
) => NodeSearchMatch;

function searchMatchBuilder(search: Search): SearchMatchBuilder {
  const searcher = buildSearcher(search.text, search.caseSensitive);

  function matchKey(key: Nullable<Json.Key>): SearchMatchRange[] {
    return typeof key === "string" ? searcher.findMatches(key) : [];
  }

  function matchValue(value: Json.Root): SearchMatchRange[] {
    return Json.isLiteral(value)
      ? searcher.findMatches(value?.toString() ?? "null")
      : [];
  }

  function inAncestor(parentMatch?: NodeSearchMatch): boolean {
    return parentMatch?.inAncestor || parentMatch?.inKey || false;
  }

  return function buildSearchMatch(
    node: JsonWalkDefaultNode,
    parentMatch?: NodeSearchMatch,
  ): NodeSearchMatch {
    const keyMatches = matchKey(node.key);
    const valueMatches = matchValue(node.value);

    return {
      keyMatches,
      valueMatches,
      inKey: keyMatches.length > 0,
      inValue: valueMatches.length > 0,
      inAncestor: inAncestor(parentMatch),
      inDescendant: false, // will be updated by later iterations
    };
  };
}

function notifyMatchToAncestors(
  searchMatches: Map<string, NodeSearchMatch>,
  matchedNode: JsonWalkDefaultNode,
) {
  let ancestor = matchedNode.parent;
  while (ancestor) {
    const match = searchMatches.get(ancestor.id)!;
    match.inDescendant = true;
    ancestor = ancestor.parent;
  }
}

interface KeepStrategy {
  keep(match: NodeSearchMatch): boolean;
}

function buildKeepStrategy({ visibility }: Search): KeepStrategy {
  switch (visibility) {
    case SearchVisibility.All:
      return new KeepAll();
    case SearchVisibility.Subtree:
      return new KeepSubtree();
    case SearchVisibility.Match:
      return new KeepUntilMatch();
  }
}

class KeepAll implements KeepStrategy {
  keep(_match: NodeSearchMatch): boolean {
    return true;
  }
}

class KeepSubtree implements KeepStrategy {
  keep(match: NodeSearchMatch): boolean {
    return (
      match.inAncestor || match.inKey || match.inDescendant || match.inValue
    );
  }
}

class KeepUntilMatch implements KeepStrategy {
  keep(match: NodeSearchMatch): boolean {
    return match.inKey || match.inDescendant || match.inValue;
  }
}
