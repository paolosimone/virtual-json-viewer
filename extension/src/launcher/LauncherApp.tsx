import React, { useState } from "react";
import { ViewerApp } from "../viewer/ViewerApp";

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
      <input type="file" accept=".json" multiple={false} onChange={onChange} />
    </form>
  );
}

// TODO launch all pages
export function LauncherApp() {
  const [jsonText, setJsonText] = useState("{}");

  return (
    <div className="flex flex-col h-screen">
      <div>
        <JsonPicker onFileRead={setJsonText} />
      </div>
      <div className="flex-1">
        <ViewerApp jsonText={jsonText} wasmFile="jq.wasm" />
      </div>
    </div>
  );
}
