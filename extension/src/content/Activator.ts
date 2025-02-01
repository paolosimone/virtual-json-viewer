import { STORAGE } from "viewer/commons/Storage";
import { Settings, SETTINGS_KEY } from "viewer/state";

export function isJson(): boolean {
  return isJsonContentType() || isJsonFileExtension();
}

// see: https://www.iana.org/assignments/media-types/media-types.xhtml
function isJsonContentType(): boolean {
  return (
    document.contentType.startsWith("application/") &&
    (document.contentType.endsWith("json") ||
      document.contentType.endsWith("json-seq"))
  );
}

function isJsonFileExtension(): boolean {
  const path = window.location.pathname;
  return path.endsWith(".json") || path.endsWith(".jsonl");
}

export async function checkSettings(): Promise<boolean> {
  const settings = await STORAGE.get<Settings>(SETTINGS_KEY);
  const activationUrlRegex = settings?.activationUrlRegex || null;

  if (activationUrlRegex === null) {
    return false;
  }

  if (activationUrlRegex === ".*") {
    return true;
  }

  const regex = new RegExp(activationUrlRegex);
  return regex.test(location.href);
}
