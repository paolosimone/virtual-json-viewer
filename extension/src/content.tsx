import { createRoot } from "react-dom/client";
import { App as ViewerApp } from "./viewer/App";

if (isJson()) {
  afterHeadAvailable(setupResources);
  afterDocumentLoaded(loadJsonViewer);
}

function isJson(): boolean {
  return document.contentType === "application/json";
}

function afterHeadAvailable(callback: () => void) {
  if (document.head) {
    callback();
    return;
  }

  const observer = new MutationObserver((_mutations, observer) => {
    if (document.head) {
      observer.disconnect();
      callback();
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}

function afterDocumentLoaded(callback: () => void) {
  if (document.readyState === "complete") {
    callback();
    return;
  }

  window.addEventListener("load", callback);
}

function setupResources() {
  if (document.readyState === "loading") {
    setLoading(true);
  }

  addFavicon(chrome.runtime.getURL("logo/16.png"));
  updateTitle();

  addCSSRef(chrome.runtime.getURL("static/css/content.css"));
}

function loadJsonViewer() {
  const jsonElement = document.getElementsByTagName("pre")[0];
  const jsonText = jsonElement.innerText;

  const div = document.createElement("div");
  div.style.cssText = "height: 100vh";
  jsonElement.parentNode?.replaceChild(div, jsonElement);

  setLoading(false);

  createRoot(div).render(<ViewerApp jsonText={jsonText} />);
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
