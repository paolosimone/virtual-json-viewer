import React from "react";
import ReactDOM from "react-dom";
import App from "./views/Viewer/App";

chrome.runtime.sendMessage("check-json", (isJson: boolean) => {
  if (!isJson) {
    return;
  }

  // the JSON is wrapped in a pre tag.
  const jsonElement = document.getElementsByTagName("pre")[0];
  const jsonText = jsonElement.innerText;

  const div = document.createElement("div");
  jsonElement.parentNode?.replaceChild(div, jsonElement);
  ReactDOM.render(<App jsonText={jsonText} />, div);
});
