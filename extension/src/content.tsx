import ReactDOM from "react-dom";
import { App as ViewerApp } from "./viewer/App";

// TODO test in firefox
chrome.runtime.sendMessage("checkJson", (isJson: boolean) => {
  if (!isJson) {
    return;
  }

  // workaround: improve loading time on large json
  setTextVisibility(false);

  addFavicon(chrome.runtime.getURL("static/logo/16.png"));

  if (document.readyState === "complete") {
    loadJsonViewer();
  } else {
    window.addEventListener("load", loadJsonViewer);
  }
});

function loadJsonViewer() {
  const jsonElement = document.getElementsByTagName("pre")[0];
  const jsonText = jsonElement.innerText;

  const div = document.createElement("div");
  div.style.cssText = "height: 100vh";
  jsonElement.parentNode?.replaceChild(div, jsonElement);

  setTextVisibility(true);
  addCSSRef(chrome.runtime.getURL("static/css/content.css"));

  ReactDOM.render(
    <ViewerApp
      jsonText={jsonText}
      jqWasmFile={chrome.runtime.getURL("jq.wasm")}
    />,
    div
  );
}

function setTextVisibility(visible: boolean) {
  if (visible) {
    const elem = document.getElementById("hide-text");
    elem?.parentNode?.removeChild(elem);
  } else {
    addCSS("pre { display: none; }", "hide-text");
  }
}

function addCSS(style: string, id?: string) {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = style;
  if (id) styleElement.id = id;
  document.head.appendChild(styleElement);
}

function addCSSRef(href: string) {
  const linkElement = document.createElement("link");
  linkElement.href = href;
  linkElement.type = "text/css";
  linkElement.rel = "stylesheet";
  document.head.appendChild(linkElement);
}

function addFavicon(href: string) {
  const linkElement = document.createElement("link");
  linkElement.href = href;
  linkElement.rel = "icon";
  document.head.appendChild(linkElement);
}
