import React from "react";
import ReactDOM from "react-dom";
import App from "./views/Viewer/App";

// TODO try hide pre (display: none) to improve loading time

chrome.runtime.sendMessage("check-json", (isJson: boolean) => {
  if (!isJson) {
    return;
  }

  // the JSON is wrapped in a pre tag.
  // TODO test in firefox
  const jsonElement = document.getElementsByTagName("pre")[0];
  const jsonText = jsonElement.innerText;

  const div = document.createElement("div");
  jsonElement.parentNode?.replaceChild(div, jsonElement);
  ReactDOM.render(<App jsonText={jsonText} />, div);
});
