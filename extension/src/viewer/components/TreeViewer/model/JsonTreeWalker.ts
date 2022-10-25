import { TreeWalker, TreeWalkerValue } from "react-vtree";
import * as Json from "viewer/commons/Json";
import { Search } from "../../../state";
import { JsonNode, JsonNodeData, SearchMatch } from "./JsonNode";
import { NodeFilter } from "./NodeFilter";

export function jsonTreeWalker(
  json: Json.Root,
  search: Search
): TreeWalker<JsonNodeData> {
  return search.text ? filteredTreeWalker(json, search) : fullTreeWalker(json);
}

export function getRootNodes(json: Json.Root): JsonNode[] {
  if (Json.isLeaf(json)) {
    return [{ key: null, value: json, parent: null }];
  }

  return [...Json.iterator(json as Json.Collection)].map(([key, value]) => ({
    key: key,
    value: value,
    parent: null,
  }));
}

function fullTreeWalker(json: Json.Root): TreeWalker<JsonNodeData> {
  return function* () {
    for (const node of getRootNodes(json)) {
      yield getNodeData(node);
    }

    while (true) {
      // if leaf, will return `undefined`, ending the loop
      const parent = yield;
      const json = parent.data.value;

      if (Json.isCollection(json)) {
        for (const [key, value] of Json.iterator(json)) {
          const node = { key: key, value: value, parent: parent.data };
          yield getNodeData(node);
        }
      }
    }
  };
}

function filteredTreeWalker(
  json: Json.Root,
  search: Search
): TreeWalker<JsonNodeData> {
  const filter = new NodeFilter(search);

  return function* () {
    let existsMatch = false;
    for (const node of getRootNodes(json)) {
      const match = filter.match(node);
      if (match) {
        existsMatch = true;
        yield getNodeData(node, match);
      }
    }

    if (!existsMatch) {
      yield getNodeData(NOT_FOUND_PLACEHOLDER);
    }

    while (true) {
      // if leaf, will return `undefined`, ending the loop
      const parent = yield;
      const json = parent.data.value;

      if (Json.isCollection(json)) {
        for (const [key, value] of Json.iterator(json)) {
          const node = { key: key, value: value, parent: parent.data };
          const match = filter.match(node);
          if (match) {
            yield getNodeData(node, match);
          }
        }
      }
    }
  };
}

export function buildId(
  key: Nullable<Json.Key>,
  parent: Nullable<JsonNodeData>
): string {
  return `${parent?.id ?? ""}.${key ?? ""}`;
}

function getNodeData(
  { key, value, parent }: JsonNode,
  searchMatch: Nullable<SearchMatch> = null
): TreeWalkerValue<JsonNodeData> {
  return {
    data: {
      id: buildId(key, parent),
      isOpenByDefault: (searchMatch?.inValue || false) && !Json.isLeaf(value),
      nesting: parent ? parent.nesting + 1 : 0,
      isLeaf: Json.isLeaf(value),
      key: key,
      childrenCount: Json.isCollection(value) ? value.length : null,
      value: value,
      parent: parent,
      defaultHeight: 30,
      searchMatch: searchMatch,
    },
  };
}

const NOT_FOUND_PLACEHOLDER: JsonNode = {
  key: null,
  value: null,
  parent: null,
};
