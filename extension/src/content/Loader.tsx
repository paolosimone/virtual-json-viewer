import { createRoot, Root } from "react-dom/client";
import { App as ViewerApp } from "viewer/App";
import * as Json from "viewer/commons/Json";

export function setupResources() {
  if (document.readyState === "loading") {
    setLoading(true);
  }

  addFavicon(chrome.runtime.getURL("logo/16.png"));
  updateTitle();

  addCSSRef(chrome.runtime.getURL("static/css/content.css"));
}

export function loadViewer() {
  const jsonElement = document.getElementsByTagName("pre")[0];
  renderViewer(jsonElement.innerText);
}

export function forceSetupAndLoadViewer() {
  const jsonText = tryFindJsonText();
  if (!jsonText) {
    console.warn(
      "Virtual Json Viewer forceful activation failed: JSON not found",
    );
    return;
  }

  setupResources();
  renderViewer(jsonText);
}

function setLoading(isLoading: boolean) {
  setLoadingMessage(isLoading);
  // workaround: improve loading time on large json
  setTextVisibility(!isLoading);
}

function setLoadingMessage(show: boolean) {
  if (show) {
    const elem = document.createElement("div");
    elem.id = "loading";
    elem.innerText = "Loading...";
    document.body.appendChild(elem);
  } else {
    const elem = document.getElementById("loading");
    elem?.parentNode?.removeChild(elem);
  }
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

function renderViewer(jsonText: string) {
  const reactRoot = replaceBodyContent();
  setLoading(false);
  reactRoot.render(<ViewerApp jsonText={jsonText} />);
}

function replaceBodyContent(): Root {
  const div = document.createElement("div");
  div.style.cssText = "height: 100vh";
  document.body.replaceChildren(div);
  return createRoot(div);
}

function tryFindJsonText(): string | undefined {
  const candidates = [];

  // textual content
  const preformatted = document.getElementsByTagName("pre");
  if (preformatted.length == 1) {
    candidates.push(preformatted[0].innerText);
  }

  // body
  candidates.push(document.body.innerText);

  return candidates.find(
    (candidate) => !(Json.tryParseLines(candidate) instanceof Error),
  );
}
