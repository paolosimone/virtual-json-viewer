import * as Json from "@/viewer/commons/Json";
import { Search } from "@/viewer/state";
import { NodeData, NodeInput, SearchMatch } from "./NodeData";
import { TreeSearch } from "./TreeSearch";

export type TreeLevelWalker = Generator<NodeData, void, undefined>;
export type TreeWalker = (parent?: NodeData) => TreeLevelWalker;

export function treeWalker(
  json: Json.Root,
  search: Search,
  expandNodes: boolean,
): TreeWalker {
  const buildNode = nodeDataBuilder(expandNodes);
  return search.text
    ? filteredJsonWalker(json, buildNode, search)
    : fullJsonWalker(json, buildNode);
}

function fullJsonWalker(
  root: Json.Root,
  buildNode: NodeDataBuilder,
): TreeWalker {
  function* walkRoot() {
    for (const input of getRootInputs(root)) {
      yield buildNode(input);
    }
  }

  return function* walkNode(parent?: NodeData) {
    if (parent === undefined) {
      yield* walkRoot();
      return;
    }

    if (parent.isLeaf) {
      return;
    }

    const children = parent.value as Json.Collection;
    for (const [key, value] of Json.iterator(children)) {
      yield buildNode({ key, value, parent });
    }
  };
}

function filteredJsonWalker(
  root: Json.Root,
  buildNode: NodeDataBuilder,
  search: Search,
): TreeWalker {
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

  return function* walkNode(parent?: NodeData) {
    if (parent === undefined) {
      yield* walkRoot();
      return;
    }

    if (parent.isLeaf) {
      return;
    }

    const children = parent.value as Json.Collection;
    for (const [key, value] of Json.iterator(children)) {
      const input = { key, value, parent };
      const match = filter.match(input);
      if (match) {
        yield buildNode(input, match);
      }
    }
  };
}

function getRootInputs(json: Json.Root): NodeInput[] {
  if (Json.isLeaf(json)) {
    return [{ key: null, value: json, parent: null }];
  }

  return [...Json.iterator(json as Json.Collection)].map(([key, value]) => ({
    key: key,
    value: value,
    parent: null,
  }));
}

function buildId(key: Nullable<Json.Key>, parent: Nullable<NodeData>): string {
  return `${parent?.id ?? ""}.${key ?? ""}`;
}

type NodeDataBuilder = (
  input: NodeInput,
  searchMatch?: Nullable<SearchMatch>,
) => NodeData;

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
    { key, value, parent }: NodeInput,
    searchMatch: Nullable<SearchMatch> = null,
  ): NodeData {
    return {
      id: buildId(key, parent),
      key,
      value,
      nesting: parent ? parent.nesting + 1 : 0,
      parent,
      childrenCount: Json.isCollection(value) ? Json.length(value) : null,
      isLeaf: Json.isLeaf(value),
      isOpenByDefault: isOpenByDefault(value, searchMatch),
      searchMatch,
    };
  };
}

const NOT_FOUND_PLACEHOLDER: NodeInput = {
  key: null,
  value: null,
  parent: null,
};
