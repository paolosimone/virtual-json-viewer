export enum Runtime {
  Extension = "extension",
  Web = "web",
}

function detectRuntime(): Runtime {
  try {
    return chrome.runtime.id ? Runtime.Extension : Runtime.Web;
  } catch {
    return Runtime.Web;
  }
}

export const RUNTIME = detectRuntime();

export function getURL(path: string): string {
  return RUNTIME === Runtime.Extension ? chrome.runtime.getURL(path) : path;
}
