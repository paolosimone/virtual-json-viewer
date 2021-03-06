import ReactDOM from "react-dom";
import { App as ViewerApp } from "./viewer/App";

chrome.runtime.sendMessage("checkJson", (isJson: boolean) => {
  if (!isJson) {
    return;
  }

  // workaround: improve loading time on large json
  setTextVisibility(false);

  addFavicon(chrome.runtime.getURL("logo/16.png"));
  updateTitle();

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

function updateTitle() {
  const segments = window.location.pathname.split("/");
  // handle potential trailing slash
  const last = segments.pop() || segments.pop();
  if (last) document.title = last;
}
