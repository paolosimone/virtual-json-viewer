import { useCallback, useContext } from "react";
import * as Json from "viewer/commons/Json";
import { Icon, IconButton } from "viewer/components";
import { CHORD_KEY, useGlobalKeydownEvent } from "viewer/hooks";
import { TranslationContext } from "viewer/localization";
import { SettingsContext } from "viewer/state";

export type SaveButtonProps = Props<{
  json: Json.Root;
}>;

export function SaveButton({ json, className }: SaveButtonProps): JSX.Element {
  const t = useContext(TranslationContext);
  const { indentation } = useContext(SettingsContext);
  const save = useCallback(() => saveJson(json, indentation), [json]);

  // register global shortcut
  const handleShortcut = useCallback(
    (e: KeyboardEvent) => {
      if (e[CHORD_KEY] && e.key == "s") {
        e.preventDefault();
        save();
      }
    },
    [save]
  );
  useGlobalKeydownEvent(handleShortcut);

  return (
    <IconButton
      className={className}
      title={t.toolbar.save}
      icon={Icon.Save}
      onClick={save}
    />
  );
}

function saveJson(json: Json.Root, indent: number) {
  let filename = document.title;
  if (!filename.endsWith(".json")) {
    filename += ".json";
  }

  const text = Json.toString(json, { sortKeys: true, space: indent });

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
