import { TreeWalker, TreeWalkerValue } from "react-vtree";
import * as J from "viewer/commons/JsonUtils";
import { Search } from "../../commons/Search";
import { JsonNode, JsonNodeData, SearchMatch } from "./JsonNode";
import { NodeFilter } from "./NodeFilter";

export function jsonTreeWalker(
  json: Json,
  search: Search
): TreeWalker<JsonNodeData> {
  return search.text ? filteredTreeWalker(json, search) : fullTreeWalker(json);
}

export function getRootNodes(json: Json): JsonNode[] {
  if (isLeaf(json)) {
    return [{ key: "", value: json, parent: null }];
  }

  return [...J.iterator(json as JsonCollection)].map(([key, value]) => ({
    key: key,
    value: value,
    parent: null,
  }));
}

export function isLeaf(json: Json): boolean {
  return J.isLiteral(json) || J.isEmpty(json);
}

function fullTreeWalker(json: Json): TreeWalker<JsonNodeData> {
  return function* () {
    for (const node of getRootNodes(json)) {
      yield getNodeData(node);
    }

    while (true) {
      // if leaf, will return `undefined`, ending the loop
      const parent = yield;
      const json = parent.data.value;

      if (J.isCollection(json)) {
        for (let [key, value] of J.iterator(json)) {
          const node = { key: key, value: value, parent: parent.data };
          yield getNodeData(node);
        }
      }
    }
  };
}

function filteredTreeWalker(
  json: Json,
  search: Search
): TreeWalker<JsonNodeData> {
  const filter = NodeFilter.fromSearch(search);

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

      if (J.isCollection(json)) {
        for (let [key, value] of J.iterator(json)) {
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

function getNodeData(
  { key, value, parent }: JsonNode,
  searchMatch: Nullable<SearchMatch> = null
): TreeWalkerValue<JsonNodeData> {
  return {
    data: {
      id: parent ? `${parent.id}.${key}` : key,
      isOpenByDefault: (searchMatch?.inValue || false) && !isLeaf(value),
      nesting: parent ? parent.nesting + 1 : 0,
      isLeaf: isLeaf(value),
      key: key,
      childrenCount: J.isCollection(value) ? J.length(value) : null,
      value: value,
      parent: parent,
      defaultHeight: 30,
      searchMatch: searchMatch,
    },
  };
}

const NOT_FOUND_PLACEHOLDER: JsonNode = {
  key: "",
  value: "Not found",
  parent: null,
};
