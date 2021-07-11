import React, { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import { FixedSizeTree as Tree } from "react-vtree";
import { NodeComponentProps, TreeWalker } from "react-vtree/dist/es/Tree";
import jq from "../../vendor/jq.wasm";
import "./App.css";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type Json = JsonObject | JsonArray;

type JsonNodeData = {
  id: string;
  isOpenByDefault: boolean;
  name: string;
  nestingLevel: number;
};

function getNodeData(node: JsonValue, nestingLevel: number): JsonNodeData {
  const id = "ciao";
  return {
    id: id, // mandatory
    isOpenByDefault: true, // mandatory
    name: id,
    nestingLevel,
  };
}

// if (a.constructor == Object) {
//   // code here...
// }

// TODO right tree walker
function jsonTreeWalker(treeNodes: Json): TreeWalker<JsonNodeData> {
  return function* () {
    if (!Array.isArray(treeNodes)) {
      treeNodes = [treeNodes];
    }

    for (let i = 0; i < treeNodes.length; i++) {
      yield getNodeData(treeNodes[i], 0);
    }

    // const stack = [];

    // // Remember all the necessary data of the first node in the stack.
    // stack.push({
    //   nestingLevel: 0,
    //   node: tree,
    // });

    // // Walk through the tree until we have no nodes available.
    // while (stack.length !== 0) {
    //   const {
    //     node: {children = [], id, name},
    //     nestingLevel,
    //   } = stack.pop();

    //   // Here we are sending the information about the node to the Tree component
    //   // and receive an information about the openness state from it. The
    //   // `refresh` parameter tells us if the full update of the tree is requested;
    //   // basing on it we decide to return the full node data or only the node
    //   // id to update the nodes order.
    //   const isOpened = yield refresh
    //     ? {
    //         id,
    //         isLeaf: children.length === 0,
    //         isOpenByDefault: true,
    //         name,
    //         nestingLevel,
    //       }
    //     : id;

    //   // Basing on the node openness state we are deciding if we need to render
    //   // the child nodes (if they exist).
    //   if (children.length !== 0 && isOpened) {
    //     // Since it is a stack structure, we need to put nodes we want to render
    //     // first to the end of the stack.
    //     for (let i = children.length - 1; i >= 0; i--) {
    //       stack.push({
    //         nestingLevel: nestingLevel + 1,
    //         node: children[i],
    //       });
    //     }
    //   }
    // }
  };
}

// Node component receives all the data we created in the `treeWalker` +
// internal openness state (`isOpen`), function to change internal openness
// state (`setOpen`) and `style` parameter that should be added to the root div.
function JsonNode({
  data,
  isOpen,
  style,
  toggle,
}: NodeComponentProps<JsonNodeData>) {
  return (
    <div style={style}>
      {/* {!isLeaf && (
      <button type="button" onClick={() => setOpen(!isOpen)}>
        {isOpen ? '-' : '+'}
      </button>
    )} */}
      <div>{data.name}</div>
    </div>
  );
}

// eslint-disable-next-line
function JsonTree(json: Json) {
  // TODO fill height
  // TODO render test
  const treeWalker = jsonTreeWalker(json);
  return (
    <Tree treeWalker={treeWalker} itemSize={30} height={150} width={300}>
      {JsonNode}
    </Tree>
  );
}

function App(props: { jsonText: string }) {
  // TODO add flag props for profiling
  const query = ".";
  const [json, setJson] = useState(null);

  useEffect(() => {
    setJson(null);
    jq.promised.raw(props.jsonText, query).then((jsonText: string) => {
      const parseStart = performance.now();
      const json = JSON.parse(jsonText);
      console.log(`JSON.parse: ${performance.now() - parseStart} ms`);
      setJson(json);
    });
  }, [props.jsonText, query]);

  return (
    <Container>
      <Row>
        <h1>Json Viewer</h1>
      </Row>
      <Row>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {json == null ? "loading..." : JSON.stringify(json, null, 2)}
        </p>
      </Row>
    </Container>
  );
}

export default App;
