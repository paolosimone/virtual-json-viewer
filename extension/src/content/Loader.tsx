import { createRoot, Root } from "react-dom/client";
import { App as ViewerApp } from "@/viewer/App";
import * as Json from "@/viewer/commons/Json";
import * as DomEvents from "./DomEvents";

const FAVICON_URL = chrome.runtime.getURL("assets/logo/16.png");
const CONTENT_CSS_URL = chrome.runtime.getURL("assets/content.css");

export function loadIncrementally() {
  DomEvents.headAvailable().then(setupResources);
  DomEvents.documentLoaded().then(loadViewer);
}

export function tryLoadAfterDocumentLoaded() {
  DomEvents.documentLoaded()
    .then(checkResourcesAccess)
    .then(forceSetupAndLoadViewer)
    .catch((error) => {
      console.warn(`Virtual Json Viewer activation failed: ${error.message}`);
    });
}

function setupResources() {
  if (document.readyState === "loading") {
    setLoading(true);
  }

  addFavicon(FAVICON_URL);
  updateTitle();

  addCSSRef(CONTENT_CSS_URL);
}

function loadViewer() {
  const jsonElement = document.getElementsByTagName("pre")[0];
  renderViewer(jsonElement.innerText);
}

function forceSetupAndLoadViewer() {
  const jsonText = tryFindJsonText();
  if (!jsonText) {
    throw new Error("JSON expected but not found");
  }

  setupResources();
  renderViewer(jsonText);
}

// For some URLs Firefox blocks access to extension assets
// despite having them listed in manifest's web_accessible_resources.
// See https://github.com/paolosimone/virtual-json-viewer/issues/61
async function checkResourcesAccess(): Promise<void> {
  const response = await fetch(CONTENT_CSS_URL);
  if (!response.ok) {
    throw new Error(
      `GET ${CONTENT_CSS_URL} - ${response.status} ${response.statusText}`,
    );
  }
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
