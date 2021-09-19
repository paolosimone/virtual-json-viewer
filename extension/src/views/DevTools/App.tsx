import React, { useState } from "react";
import { Form } from "react-bootstrap";
import Viewer from "../Viewer/App";

function JsonPicker(props: { onFileRead: (content: string) => void }) {
  // TODO add load button
  // TODO formatting
  const reader = new FileReader();
  reader.addEventListener("load", function () {
    props.onFileRead(reader.result as string);
  });
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = event.target.files;
    if (files?.length) {
      reader.readAsText(files[0]);
    }
  };
  return (
    <Form>
      <Form.Group>
        <Form.File
          id="jsonPicker"
          label="JSON input"
          accept=".json"
          multiple={false}
          onChange={onChange}
        />
      </Form.Group>
    </Form>
  );
}

function App() {
  const [jsonText, setJsonText] = useState("{}");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        height: "100vh",
      }}
    >
      <div id="picker-row">
        <JsonPicker onFileRead={setJsonText} />
      </div>
      <div id="viewer-row" style={{ flex: "1" }}>
        <Viewer jsonText={jsonText} wasmFile="jq.wasm" />
      </div>
    </div>
  );
}

export default App;
