import classNames from "classnames";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AutoSizer } from "react-virtualized";
import "react-virtualized/styles.css";
import {
  TreeWalker,
  TreeWalkerValue,
  VariableSizeNodePublicState,
  VariableSizeTree as Tree,
} from "react-vtree";
import { NodeComponentProps } from "react-vtree/dist/es/Tree";
import "tailwindcss/tailwind.css";
import newJQ from "vendor/jq-web.wasm";
import { Toolbar } from "./toolbar/Toolbar";
import "./ViewerApp.css";

type Json = JsonLiteral | JsonCollection;
type JsonLiteral = string | number | boolean | null;
type JsonCollection = JsonObject | JsonArray;
type JsonObject = { [key: string]: Json };
type JsonArray = Json[];

function isObject(json: Json): json is JsonObject {
  return typeof json === "object" && json !== null && !Array.isArray(json);
}

function isArray(json: Json): json is JsonArray {
  return Array.isArray(json);
}

function isCollection(json: Json): json is JsonCollection {
  return isObject(json) || isArray(json);
}

function isLiteral(json: Json): json is JsonLiteral {
  return !isCollection(json);
}

function isString(value: JsonLiteral): value is string {
  return typeof value == "string";
}

function isNumber(value: JsonLiteral): value is number {
  return typeof value == "number";
}

function isBoolean(value: JsonLiteral): value is boolean {
  return typeof value == "boolean";
}

function isNull(value: JsonLiteral): value is null {
  return value === null;
}

function length(json: JsonCollection): number {
  return Object.keys(json).length;
}

function isEmpty(json: JsonCollection): boolean {
  return length(json) === 0;
}

function isLeaf(json: Json): boolean {
  return isLiteral(json) || isEmpty(json);
}

const MIN_HEIGHT = 30;

type JsonNode = {
  key: string;
  value: Json;
  parent: Nullable<JsonNodeData>;
};

type SearchMatch = {
  inKey: boolean;
  inValue: boolean;
  inAncestor: boolean;
};

// TODO option to enable case sensitive match
function matchNode(
  { key, value, parent }: JsonNode,
  search: string
): Nullable<SearchMatch> {
  if (!search) {
    return null;
  }

  const searchToLower = search.toLowerCase();

  const matchKey =
    (!isArray(parent?.value ?? null) &&
      key?.toLowerCase()?.includes(searchToLower)) ||
    false;

  const matchValue =
    value !== null &&
    JSON.stringify(value)?.toLowerCase()?.includes(searchToLower);

  const matchAncestor =
    parent?.searchMatch?.inKey || parent?.searchMatch?.inAncestor || false;

  return {
    inKey: matchKey,
    inValue: matchValue,
    inAncestor: matchAncestor,
  };
}

type JsonNodeData = {
  id: string;
  isOpenByDefault: boolean;
  isLeaf: boolean;
  key: Nullable<string>;
  value: Json;
  nesting: number;
  childrenCount: Nullable<number>;
  parent: Nullable<JsonNodeData>;
  defaultHeight: number;
  searchMatch: Nullable<SearchMatch>;
};

function getNodeData(
  { key, value, parent }: JsonNode,
  searchMatch: Nullable<SearchMatch>
): TreeWalkerValue<JsonNodeData> {
  return {
    data: {
      id: parent ? `${parent.id}.${key}` : key,
      isOpenByDefault: (searchMatch?.inValue || false) && !isLeaf(value),
      nesting: parent ? parent.nesting + 1 : 0,
      isLeaf: isLeaf(value),
      key: key,
      childrenCount: isCollection(value) ? length(value) : null,
      value: value,
      parent: parent,
      defaultHeight: MIN_HEIGHT,
      searchMatch: searchMatch,
    },
  };
}

function* jsonIterator(
  json: JsonCollection
): Generator<[string, Json], void, void> {
  if (isArray(json)) {
    for (let i = 0; i < json.length; i++) {
      yield [i.toString(), json[i]];
    }
  } else if (isObject(json)) {
    for (let key in json) {
      yield [key, json[key]];
    }
  }
}

// TODO option to remove unrelevant nodes or keep them but faded
function isRelevantMatch(match: Nullable<SearchMatch>): boolean {
  if (!match) {
    return true;
  }

  return match.inAncestor || match.inValue || match.inKey;
}

function getRoots(json: Json): JsonNode[] {
  if (isLeaf(json)) {
    return [{ key: "", value: json, parent: null }];
  }

  return [...jsonIterator(json as JsonCollection)].map(([key, value]) => ({
    key: key,
    value: value,
    parent: null,
  }));
}

function jsonTreeWalker(json: Json, search: string): TreeWalker<JsonNodeData> {
  return function* () {
    let existsMatch = false;
    for (const node of getRoots(json)) {
      const match = matchNode(node, search);
      if (isRelevantMatch(match)) {
        existsMatch = true;
        yield getNodeData(node, match);
      }
    }

    if (!existsMatch) {
      const placeholderNode = { key: "", value: "Not found", parent: null };
      yield getNodeData(placeholderNode, null);
    }

    while (true) {
      // if leaf, will return `undefined`, ending the loop
      const parent = yield;
      const json = parent.data.value;

      if (isCollection(json)) {
        for (let [key, value] of jsonIterator(json)) {
          const node = { key: key, value: value, parent: parent.data };
          const match = matchNode(node, search);
          if (isRelevantMatch(match)) {
            yield getNodeData(node, match);
          }
        }
      }
    }
  };
}

type NodeOpenProps = {
  data: JsonNodeData;
  isOpen: boolean;
  setOpen: (state: boolean) => Promise<void>;
};

function NodeOpen({
  data: { isLeaf },
  isOpen,
  setOpen,
}: NodeOpenProps): JSX.Element {
  if (isLeaf) {
    return <span className="w-5 mr-0.5" />;
  }

  return (
    <button
      className="w-5 mr-0.5 text-gray-600"
      onClick={() => setOpen(!isOpen)}
    >
      {isOpen ? "⮟" : "⮞"}
    </button>
  );
}

type NodeKeyProps = {
  data: JsonNodeData;
};

function NodeKey({ data: { key, parent } }: NodeKeyProps): JSX.Element {
  if (!key && !parent) {
    return <span />;
  }

  return <span className="mr-4 whitespace-pre-wrap text-blue-600">{key}:</span>;
}

type NodeValueProps = {
  data: JsonNodeData;
  isOpen: boolean;
};

function NodeValue({
  data: { value, childrenCount },
  isOpen,
}: NodeValueProps): JSX.Element {
  if (isOpen) {
    return <span />;
  }

  if (isCollection(value)) {
    const count = childrenCount ? `↤ ${childrenCount} ↦` : "";
    const preview = isArray(value) ? `[${count}]` : `{${count}}`;
    return <span className="truncate text-gray-600">{preview}</span>;
  }

  if (isString(value)) {
    return <span className="whitespace-pre-wrap text-pink-600">"{value}"</span>;
  }

  return <span className="text-green-600">{value?.toString() ?? "null"}</span>;
}

// -- v1
// TODO clean and refactor code
// TODO popup
// TODO readme
// TODO logo
// -- v2
// TODO jq (in new tabs)
// -- backlog
// TODO raw
// TODO raw pretty print / minify
// TODO copy
// TODO save
// TODO search highlight
// TODO search hide faded
// TODO search match case
// TODO search regex search
// TODO dark mode
// TODO clickable links
// TODO internationalization
// TODO profiling
// TODO options page
function JsonTreeNode({
  data,
  style,
  resize,
  isOpen,
  setOpen,
}: NodeComponentProps<
  JsonNodeData,
  VariableSizeNodePublicState<JsonNodeData>
>): JSX.Element {
  const row = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  // TODO MIN_HEIGHT = 0 + margin?
  const fitContent = () => {
    const oldHeight = row.current?.clientHeight ?? MIN_HEIGHT;
    const newHeight = Math.max(content.current?.clientHeight ?? 0, MIN_HEIGHT);
    if (newHeight !== oldHeight) {
      resize(newHeight, true);
    }
  };

  useEffect(fitContent);

  const isRelevantContent =
    !data.searchMatch ||
    data.searchMatch.inKey ||
    (data.isLeaf && data.searchMatch.inValue);

  const fadeContent = {
    "opacity-60": !isRelevantContent,
  };

  return (
    <div ref={row} style={{ ...style, marginLeft: `${data.nesting}em` }}>
      <div
        ref={content}
        className={classNames("flex items-start", fadeContent)}
      >
        <NodeOpen data={data} isOpen={isOpen} setOpen={setOpen} />
        <NodeKey data={data} />
        <NodeValue data={data} isOpen={isOpen} />
      </div>
    </div>
  );
}

type JsonViewerProps = {
  json: Json;
  search: string;
};

function JsonViewer({ json, search }: JsonViewerProps): JSX.Element {
  const [, fakeUpdate] = React.useState<any>();

  // force rerender on window resize (with throttle)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const onResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fakeUpdate({}), 100);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fakeUpdate]);

  // TODO memoize treewalker
  const tree = useRef<Tree<JsonNodeData>>(null);
  const setOpen = useCallback(
    (isOpen: boolean) => {
      function subtreeCallback(
        node: VariableSizeNodePublicState<JsonNodeData>,
        ownerNode: VariableSizeNodePublicState<JsonNodeData>
      ) {
        if (node !== ownerNode) {
          node.isOpen = !node.data.isLeaf && isOpen;
        }
      }
      const newState = Object.fromEntries(
        getRoots(json).map(({ key, value }) => [
          key,
          { open: !isLeaf(value) && isOpen, subtreeCallback },
        ])
      );
      tree.current?.recomputeTree(newState);
    },
    [json, tree]
  );

  useEffect(() => {
    const expand = () => setOpen(true);
    document.addEventListener("expand", expand, false);

    const collapse = () => setOpen(false);
    document.addEventListener("collapse", collapse, false);

    return () => {
      document.removeEventListener("expand", expand);
      document.removeEventListener("collapse", collapse);
    };
  }, [setOpen]);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <Tree
          ref={tree}
          treeWalker={jsonTreeWalker(json, search)}
          height={height}
          width={width}
        >
          {JsonTreeNode}
        </Tree>
      )}
    </AutoSizer>
  );
}

export function ViewerApp(props: { jsonText: string; wasmFile: string }) {
  // TODO add flag props for profiling
  // TODO investigate multiple invocations failure
  const query = ".";

  // TODO temporary disable JQ
  const [jq, setJQ] = useState(null);
  useEffect(() => {
    newJQ({ locateFile: () => props.wasmFile }).then((module: any) =>
      setJQ(module)
    );
  }, [props.wasmFile]);

  const [json, setJson] = useState(null);
  useEffect(() => {
    if (jq == null) {
      return;
    }

    setJson(null);
    (jq as any).invoke(props.jsonText, query).then((jsonText: string) => {
      const json = JSON.parse(jsonText);
      setJson(json);
    });
  }, [jq, props.jsonText, query]);

  // const jsonTree = json
  //   ? JSON.stringify(json, null, 2).substring(0, 10_000)
  //   : "loading...";

  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-full pl-4 pt-4 font-mono">
      <Toolbar onSearch={setSearch} />
      <div className="flex-1">
        {/* <p style={{ whiteSpace: "pre-wrap" }}>{jsonTree}</p> */}
        <JsonViewer json={json} search={search} />
      </div>
    </div>
  );
}
