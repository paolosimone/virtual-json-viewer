import { useCallback } from "react";
import { Icon, IconButton } from "viewer/components";

export type SaveButtonProps = Props<{
  json: Json;
}>;

// TODO setting tab size
const TAB_SIZE = 2;

export function SaveButton({ json, className }: SaveButtonProps): JSX.Element {
  const save = useCallback(() => saveJson(json, TAB_SIZE), [json]);

  return (
    <IconButton
      className={className}
      title="Download"
      icon={Icon.Save}
      onClick={save}
    />
  );
}

function saveJson(json: Json, indent: number) {
  let filename = document.title;
  if (!filename.endsWith(".json")) {
    filename += ".json";
  }

  const text = JSON.stringify(json, undefined, indent);

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
