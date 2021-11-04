import { useCallback, useContext } from "react";
import { Icon, IconButton } from "viewer/components";
import { TranslationContext } from "viewer/localization";
import { SettingsContext } from "viewer/state";

export type SaveButtonProps = Props<{
  json: Json;
}>;

export function SaveButton({ json, className }: SaveButtonProps): JSX.Element {
  const t = useContext(TranslationContext);
  const { indentation } = useContext(SettingsContext);
  const save = useCallback(() => saveJson(json, indentation), [json]);

  return (
    <IconButton
      className={className}
      title={t.toolbar.save}
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
