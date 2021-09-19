import React, { useState } from "react";
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
    <form>
        <input type="file" accept=".json" multiple={false} onChange={onChange}/>
    </form>
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
