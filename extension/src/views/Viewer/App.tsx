import React, { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
// TODO wait for next official release
import { FixedSizeTree as Tree } from "react-vtree/lib/FixedSizeTree";
import {
  NodeComponentProps,
  NodePublicState,
  TreeWalker,
  TreeWalkerValue,
} from "react-vtree/lib/Tree";
import newJQ from "../../vendor/jq-web.wasm";
import "./App.css";

type Json = JsonLiteral | JsonObject | JsonArray;
type JsonLiteral = string | number | boolean | null;
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

function isObject(value: Json): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArray(value: Json): value is JsonArray {
  return Array.isArray(value);
}

function isPrimitive(value: Json): value is JsonLiteral {
  return !isObject(value) && !isArray(value);
}

function isString(value: Json): value is string {
  return typeof value == "string";
}

function isNumber(value: Json): value is number {
  return typeof value == "number";
}

function isBoolean(value: Json): value is boolean {
  return typeof value == "boolean";
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
      isLeaf: isPrimitive(json),
      isOpenByDefault: false, // mandatory
      key: key,
      value: value,
      json: json,
      nestingLevel: parent ? parent.nestingLevel + 1 : 0,
      parent: parent,
    },
  };
}

// TODO right tree walker
// TODO handle empty object/array
function jsonTreeWalker(json: Json): TreeWalker<JsonNodeData> {
  return function* () {
    console.log(`building..`);

    if (isArray(json)) {
      console.log(`array`);
      for (let i = 0; i < json.length; i++) {
        yield getNodeData(i.toString(), json[i], null);
      }
    } else if (isObject(json)) {
      console.log(`object`);
      for (let key in json) {
        yield getNodeData(key, json[key], null);
      }
    } else {
      console.log(`else`);
      yield getNodeData("", json, null);
    }

    while (true) {
      console.log(`while true..`);
      const parent = yield;

      const json = parent.data.json;
      console.log(`${parent.data.key}: ${parent.data.isLeaf}`);

      if (isArray(json)) {
        for (let i = 0; i < json.length; i++) {
          console.log(`array inside`);
          yield getNodeData(i.toString(), json[i], parent.data);
        }
      } else if (isObject(json)) {
        console.log(`object inside`);
        for (let key in json) {
          yield getNodeData(key, json[key], parent.data);
        }
      }
    }
  };
}

function JsonNode({
  data: { isLeaf, key, value },
  isOpen,
  style,
  setOpen,
}: NodeComponentProps<JsonNodeData, NodePublicState<JsonNodeData>>) {
  return (
    <div style={style}>
      {!isLeaf && (
        <button type="button" onClick={() => setOpen(!isOpen)}>
          {isOpen ? "-" : "+"}
        </button>
      )}
      <div>
        {key}: {value}
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
