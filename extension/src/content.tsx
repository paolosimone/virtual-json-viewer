import React from "react";
import ReactDOM from "react-dom";
import { ViewerApp } from "./viewer/ViewerApp";

// TODO test in firefox
chrome.runtime.sendMessage("check-json", (isJson: boolean) => {
  if (!isJson) {
    return;
  }

  disableDefaultRendering();

  if (document.readyState === "complete") {
    loadJsonViewer();
  } else {
    window.addEventListener("load", loadJsonViewer);
  }
});

// workaround: improve loading time on large json
function disableDefaultRendering() {
  addCSS(`pre { display: none; }`);
}

function loadJsonViewer() {
  const jsonElement = document.getElementsByTagName("pre")[0];
  const jsonText = jsonElement.innerText;

  // TODO body 100vh?
  const div = document.createElement("div");
  div.style.cssText = `height: 100vh`;
  jsonElement.parentNode?.replaceChild(div, jsonElement);
  // TODO remove css
  ReactDOM.render(
    <ViewerApp
      jsonText={jsonText}
      wasmFile={chrome.runtime.getURL("jq.wasm")}
    />,
    div
  );
}

function addCSS(style: string) {
  const styleElement = document.head.appendChild(
    document.createElement("style")
  );
  styleElement.innerHTML = style;
}
