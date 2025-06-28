import * as Json from "@/viewer/commons/Json";
import { Search } from "@/viewer/state";
import { JsonNode, JsonNodeInput, SearchMatch } from "./JsonNode";
import { JsonNodeFilter } from "./JsonNodeFilter";

export type JsonWalker = (
  parent?: JsonNode,
) => Generator<JsonNode, void, undefined>;

export function jsonWalker(
  json: Json.Root,
  search: Search,
  expandNodes: boolean,
): JsonWalker {
  const buildNode = jsonNodeBuilder(expandNodes);
  return search.text
    ? filteredJsonWalker(json, buildNode, search)
    : fullJsonWalker(json, buildNode);
}

function fullJsonWalker(
  root: Json.Root,
  buildNode: JsonNodeBuilder,
): JsonWalker {
  function* walkRoot() {
    for (const input of getRootInputs(root)) {
      yield buildNode(input);
    }
  }

  return function* walkNode(parent?: JsonNode) {
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
  buildNode: JsonNodeBuilder,
  search: Search,
): JsonWalker {
  const filter = new JsonNodeFilter(search);

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

  return function* walkNode(parent?: JsonNode) {
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

function getRootInputs(json: Json.Root): JsonNodeInput[] {
  if (Json.isLeaf(json)) {
    return [{ key: null, value: json, parent: null }];
  }

  return [...Json.iterator(json as Json.Collection)].map(([key, value]) => ({
    key: key,
    value: value,
    parent: null,
  }));
}

function buildId(key: Nullable<Json.Key>, parent: Nullable<JsonNode>): string {
  return `${parent?.id ?? ""}.${key ?? ""}`;
}

type JsonNodeBuilder = (
  input: JsonNodeInput,
  searchMatch?: Nullable<SearchMatch>,
) => JsonNode;

function jsonNodeBuilder(expandNodes: boolean): JsonNodeBuilder {
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
    { key, value, parent }: JsonNodeInput,
    searchMatch: Nullable<SearchMatch> = null,
  ): JsonNode {
    return {
      id: buildId(key, parent),
      key: key,
      value: value,
      nesting: parent ? parent.nesting + 1 : 0,
      parent: parent,
      childrenCount: Json.isCollection(value) ? Json.length(value) : null,
      isLeaf: Json.isLeaf(value),
      isOpenByDefault: isOpenByDefault(value, searchMatch),
      searchMatch: searchMatch,
    };
  };
}

const NOT_FOUND_PLACEHOLDER: JsonNodeInput = {
  key: null,
  value: null,
  parent: null,
};
