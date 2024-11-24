import { STORAGE } from "viewer/commons/Storage";
import { Settings, SETTINGS_KEY } from "viewer/state";

// see: https://www.iana.org/assignments/media-types/media-types.xhtml
export function isJsonContentType(): boolean {
  return (
    document.contentType.startsWith("application/") &&
    (document.contentType.endsWith("json") ||
      document.contentType.endsWith("json-seq"))
  );
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
