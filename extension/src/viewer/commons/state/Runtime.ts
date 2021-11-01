import { createContext } from "react";

export enum Runtime {
  Extension = "extension",
  Web = "web",
}

const runtime =
  window.chrome && chrome.runtime && chrome.runtime.id
    ? Runtime.Extension
    : Runtime.Web;

export const RuntimeContext = createContext(runtime);
