export enum Runtime {
  Extension = "extension",
  Web = "web",
}

export function getRuntime(): Runtime {
  try {
    return chrome.runtime.id ? Runtime.Extension : Runtime.Web;
  } catch {
    return Runtime.Web;
  }
}

export function getURL(path: string): string {
  return getRuntime() === Runtime.Extension
    ? chrome.runtime.getURL(path)
    : path;
}
