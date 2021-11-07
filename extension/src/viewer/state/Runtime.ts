import { createContext } from "react";

export enum Runtime {
  Extension = "extension",
  Web = "web",
}

function detectRuntime(): Runtime {
  try {
    return chrome.runtime.id ? Runtime.Extension : Runtime.Web;
  } catch (_e) {
    return Runtime.Web;
  }
}

export const RuntimeContext = createContext(detectRuntime());
