import * as Json from "@/viewer/commons/Json";
import { Icon, IconButton } from "@/viewer/components";
import { isActiveElementEditable } from "@/viewer/commons/Dom";
import {
  CHORD_KEY,
  KeydownEvent,
  useGlobalKeydownEvent,
  isUpperCaseKeypress,
} from "@/viewer/hooks";
import { TranslationContext } from "@/viewer/localization";
import { SettingsContext } from "@/viewer/state";
import classNames from "classnames";
import { JSX, useCallback, useContext, useEffect, useState } from "react";

export type CopyButtonProps = Props<{
  jsonLines: Json.Lines;
}>;

export function CopyButton({
  jsonLines,
  className,
}: CopyButtonProps): JSX.Element {
  const t = useContext(TranslationContext);
  const { sortKeys, indentation } = useContext(SettingsContext);

  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      const text = Json.linesToString(jsonLines, {
        sortKeys,
        space: indentation,
      });
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy json to clipboard: ", err);
    }
  }, [jsonLines, sortKeys, indentation]);

  useEffect(() => {
    if (!isCopied) return;

    const timerId = setTimeout(() => {
      setIsCopied(false);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [isCopied]);

  const handleShortcut = useCallback(
    (e: KeydownEvent) => {
      if (
        (e[CHORD_KEY] && isUpperCaseKeypress(e, "c")) ||
        (isUpperCaseKeypress(e, "y") && !isActiveElementEditable())
      ) {
        e.preventDefault();
        copy();
      }
    },
    [copy],
  );
  useGlobalKeydownEvent(handleShortcut);

  return (
    <IconButton
      className={classNames(
        "fill-toolbar-foreground hover:bg-toolbar-focus",
        className,
      )}
      title={t.toolbar.copy}
      icon={isCopied ? Icon.Check : Icon.Files}
      onClick={copy}
    />
  );
}
