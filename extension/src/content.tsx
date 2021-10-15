import ReactDOM from "react-dom";
import { App as ViewerApp } from "./viewer/App";

// TODO test in firefox
chrome.runtime.sendMessage("checkJson", (isJson: boolean) => {
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

  const div = document.createElement("div");
  div.style.cssText = `height: 100vh`;
  jsonElement.parentNode?.replaceChild(div, jsonElement);

  // TODO remove pre css

  // For some obscure reason `ReactDOM.render` doesn't inject CSS
  // ...so we add it manually :shrug:
  addCSSRef(chrome.runtime.getURL("static/css/content.css"));

  ReactDOM.render(
    <ViewerApp
      jsonText={jsonText}
      jqWasmFile={chrome.runtime.getURL("jq.wasm")}
    />,
    div
  );
}

function addCSS(style: string) {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = style;
  document.head.appendChild(styleElement);
}

function addCSSRef(href: string) {
  const linkElement = document.createElement("link");
  linkElement.href = href;
  linkElement.type = "text/css";
  linkElement.rel = "stylesheet";
  document.head.appendChild(linkElement);
}
