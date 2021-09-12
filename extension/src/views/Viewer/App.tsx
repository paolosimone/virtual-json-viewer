import React, { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
// TODO wait for next official release
import { FixedSizeTree as Tree } from "react-vtree/lib/FixedSizeTree";
import {
  FixedSizeTree as Tree,
  TreeWalker,
  TreeWalkerValue,
} from "react-vtree";
import { NodeComponentProps, NodePublicState } from "react-vtree/dist/es/Tree";
import newJQ from "../../vendor/jq-web.wasm";
import "./App.css";

type Json = JsonLiteral | JsonCollection;
type JsonLiteral = string | number | boolean | null;
type JsonCollection = JsonObject | JsonArray;
type JsonObject = { [key: string]: Json };
type JsonArray = Json[];

type JsonNodeData = {
  id: string;
  isOpenByDefault: boolean;
  isLeaf: boolean;
  key: string;
  value: string;
  nestingLevel: number;
  json: Json;
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

function isEmpty(json: JsonCollection): boolean {
  return Object.keys(json).length === 0;
}

function isLeaf(json: Json): boolean {
  return isLiteral(json) || isEmpty(json);
}

function getNodeData(
  key: string,
  json: Json,
  parent: JsonNodeData | null
): TreeWalkerValue<JsonNodeData> {
  let value = "";
  if (isArray(json)) {
    value = "[]";
  } else if (isObject(json)) {
    value = "{}";
  } else {
    value = json?.toString() ?? "null";
  }

  return {
    data: {
      id: parent ? parent.id + key : key, // mandatory
      isLeaf: isLeaf(json),
      isOpenByDefault: false, // mandatory
      key: key,
      value: value,
      json: json,
      nestingLevel: parent ? parent.nestingLevel + 1 : 0,
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
      yield getNodeData("", json, null);
    } else {
      for (let [key, value] of jsonIterator(json as JsonCollection)) {
        yield getNodeData(key, value, null);
      }
    }

    while (true) {
      // if leaf, will return `undefined`, ending the loop
      const parent = yield;
      const json = parent.data.json;

      if (isCollection(json)) {
        for (let [key, value] of jsonIterator(json)) {
          yield getNodeData(key, value, null);
        }
      }
    }
  };
}

// button | key | (array / object / string / number / boolean)
// TODO constant spacing
// TODO nesting levels
// TODO value colors (bootstrap color scheme?)
// TODO triangular button + collection indicator
// TODO external css (tailwind?)
// TODO variable height for long text?
function JsonNode({
  data: { isLeaf, key, value },
  isOpen,
  style,
  setOpen,
}: NodeComponentProps<JsonNodeData, NodePublicState<JsonNodeData>>) {
  return (
    <div style={style}>
      <div style={{ display: "flex", columnGap: "10px" }}>
        <div style={{ flexGrow: 1 }}>
          {!isLeaf && (
            <button type="button" onClick={() => setOpen(!isOpen)}>
              {isOpen ? "-" : "+"}
            </button>
          )}
        </div>
        <div style={{ flexGrow: 1, color: "green" }}>{key}</div>
        <div style={{ flexGrow: 4 }}>{value}</div>
      </div>
    </div>
  );
}

// eslint-disable-next-line
function JsonTree(props: { json: Json }) {
  console.log(props.json);
  if (props.json == null) {
    return <div>null</div>;
  }
  if (Object.keys(props.json).length === 0) {
    console.log("empty");
    return <div>{"{}"}</div>;
  }
  // TODO fill height
  return (
    <Tree
      treeWalker={jsonTreeWalker(props.json)}
      itemSize={60}
      height={600}
      width={900}
    >
      {JsonNode}
    </Tree>
  );
}

function App(props: { jsonText: string; wasmFile: string }) {
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
    <Container>
      <Row>
        <h1>Json Viewer</h1>
      </Row>
      <Row>
        {/* <p style={{ whiteSpace: "pre-wrap" }}>{jsonTree}</p> */}
        <JsonTree json={json} />
      </Row>
    </Container>
  );
}

export default App;
