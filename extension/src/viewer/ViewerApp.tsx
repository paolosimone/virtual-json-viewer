import React, { useEffect, useState } from "react";
import { AutoSizer } from "react-virtualized";
import "react-virtualized/styles.css";
import {
  FixedSizeTree as Tree,
  TreeWalker,
  TreeWalkerValue,
} from "react-vtree";
import { NodeComponentProps, NodePublicState } from "react-vtree/dist/es/Tree";
import "tailwindcss/tailwind.css";
import newJQ from "vendor/jq-web.wasm";
import "./ViewerApp.css";

type Json = JsonLiteral | JsonCollection;
type JsonLiteral = string | number | boolean | null;
type JsonCollection = JsonObject | JsonArray;
type JsonObject = { [key: string]: Json };
type JsonArray = Json[];

type JsonNodeData = {
  id: string;
  isOpenByDefault: boolean;
  isLeaf: boolean;
  key: string | null;
  value: Json;
  nesting: number;
  childrenCount: number | null;
  parent: JsonNodeData | null;
};

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

function getNodeData(
  key: string | null,
  value: Json,
  parent: JsonNodeData | null
): TreeWalkerValue<JsonNodeData> {
  return {
    data: {
      id: parent ? parent.id + key : String(key),
      isOpenByDefault: false,
      nesting: parent ? parent.nesting + 1 : 0,
      isLeaf: isLeaf(value),
      key: key,
      childrenCount: isCollection(value) ? length(value) : null,
      value: value,
      parent: parent,
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

function jsonTreeWalker(json: Json): TreeWalker<JsonNodeData> {
  return function* () {
    if (isLeaf(json)) {
      yield getNodeData(null, json, null);
    } else {
      for (let [key, value] of jsonIterator(json as JsonCollection)) {
        yield getNodeData(key, value, null);
      }
    }

    while (true) {
      // if leaf, will return `undefined`, ending the loop
      const parent = yield;
      const json = parent.data.value;

      if (isCollection(json)) {
        for (let [key, value] of jsonIterator(json)) {
          yield getNodeData(key, value, parent.data);
        }
      }
    }
  };
}

type NodeNestingProps = {
  data: JsonNodeData;
};

function NodeNesting({ data: { nesting } }: NodeNestingProps): JSX.Element {
  return (
    <span
      className="h-full"
      style={{ display: "inline-block", width: `${nesting}em` }}
    />
  );
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

function NodeKey({ data: { key } }: NodeKeyProps): JSX.Element {
  if (key === null) {
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
    return <span className="text-gray-600">{preview}</span>;
  }

  if (isString(value)) {
    return <span className="whitespace-pre-wrap text-pink-600">"{value}"</span>;
  }

  return <span className="text-green-600">{value?.toString() ?? "null"}</span>;
}

// TODO variable height for long text
// TODO clickable links
// TODO refactor code
// TODO theme
function JsonNode({
  data,
  isOpen,
  style,
  setOpen,
}: NodeComponentProps<JsonNodeData, NodePublicState<JsonNodeData>>) {
  return (
    <div style={style} className="flex items-start">
      <NodeNesting data={data} />
      <NodeOpen data={data} isOpen={isOpen} setOpen={setOpen} />
      <NodeKey data={data} />
      <NodeValue data={data} isOpen={isOpen} />
    </div>
  );
}

// eslint-disable-next-line
function JsonTree(props: { json: Json }) {
  return (
    <AutoSizer>
      {({ height, width }) => (
        <Tree
          treeWalker={jsonTreeWalker(props.json)}
          itemSize={30}
          height={height}
          width={width}
        >
          {JsonNode}
        </Tree>
      )}
    </AutoSizer>
  );
}

export function ViewerApp(props: { jsonText: string; wasmFile: string }) {
  // TODO add flag props for profiling
  // TODO investigate multiple invocations failure
  const query = ".";

  const [jq, setJQ] = useState(null);
  useEffect(() => {
    newJQ({ locateFile: () => props.wasmFile }).then((module: any) =>
      setJQ(module)
    );
  }, [props.wasmFile]);

  const [json, setJson] = useState(null);
  useEffect(() => {
    if (jq == null) {
      console.log("jq is null");
      return;
    }

    setJson(null);
    (jq as any).invoke(props.jsonText, query).then((jsonText: string) => {
      console.log("invoke done");
      const parseStart = performance.now();
      const json = JSON.parse(jsonText);
      console.log(`JSON.parse: ${performance.now() - parseStart} ms`);
      setJson(json);
    });
  }, [jq, props.jsonText, query]);

  // const jsonTree = json
  //   ? JSON.stringify(json, null, 2).substring(0, 10_000)
  //   : "loading...";

  return (
    <div className="flex flex-col h-full pl-4 pt-4 font-mono">
      <div className="mb-2">
        <h1 className="text-red-600">Json Viewer</h1>
      </div>
      <div className="flex-1">
        {/* <p style={{ whiteSpace: "pre-wrap" }}>{jsonTree}</p> */}
        <JsonTree json={json} />
      </div>
    </div>
  );
}
