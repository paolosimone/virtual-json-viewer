import classNames from "classnames";
import { JSX, useCallback, useContext } from "react";
import * as Json from "@/viewer/commons/Json";
import { Icon, IconButton } from "@/viewer/components";
import { CHORD_KEY, KeydownEvent, useGlobalKeydownEvent } from "@/viewer/hooks";
import { TranslationContext } from "@/viewer/localization";
import { SettingsContext } from "@/viewer/state";

export type SaveButtonProps = Props<{
  jsonLines: Json.Lines;
}>;

export function SaveButton({
  jsonLines,
  className,
}: SaveButtonProps): JSX.Element {
  const t = useContext(TranslationContext);
  const { sortKeys, indentation } = useContext(SettingsContext);
  const save = useCallback(
    () => saveJson(jsonLines, { sortKeys, space: indentation }),
    [jsonLines, sortKeys, indentation],
  );

  // register global shortcut
  const handleShortcut = useCallback(
    (e: KeydownEvent) => {
      if (e[CHORD_KEY] && e.key == "s") {
        e.preventDefault();
        save();
      }
    },
    [save],
  );
  useGlobalKeydownEvent(handleShortcut);

  return (
    <IconButton
      className={classNames(
        "fill-toolbar-foreground hover:bg-toolbar-focus",
        className,
      )}
      title={t.toolbar.save}
      icon={Icon.Save}
      onClick={save}
    />
  );
}

function saveJson(jsonLines: Json.Lines, opts: Json.ToStringOptions) {
  const extension = jsonLines.length > 1 ? ".jsonl" : ".json";

  let filename = document.title;
  if (!filename.endsWith(extension)) {
    filename += extension;
  }

  const text = Json.linesToString(jsonLines, opts);

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text),
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
