import { STORAGE } from "@/viewer/commons/Storage";
import { Settings, SETTINGS_KEY } from "@/viewer/state";

const MIME_TYPE_JSON_SUFFIXES = [
  // Official: https://www.iana.org/assignments/media-types/media-types.xhtml
  "json",
  "json-seq",
  // Candidates: https://github.com/wardi/jsonlines/issues/19
  "jsonl",
  "jsonlines",
];

export function isJsonContentType(): boolean {
  return (
    document.contentType.startsWith("application/") &&
    MIME_TYPE_JSON_SUFFIXES.some((suffix) =>
      document.contentType.endsWith(suffix),
    )
  );
}

export async function checkActivationSetting(): Promise<boolean> {
  const settings = await STORAGE.get<Settings>(SETTINGS_KEY);
  const activationUrlRegex = settings?.activationUrlRegex || null;

  if (activationUrlRegex === null) {
    return false;
  }

  const activationRegex = new RegExp(activationUrlRegex);
  const url = location.origin + location.pathname;
  return activationRegex.test(url);
}
