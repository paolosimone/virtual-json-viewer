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

// See https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API#security_considerations
const CLIPBOARD_ENABLED = navigator?.clipboard && window?.isSecureContext;

export type CopyButtonProps = Props<{
  jsonLines: Json.Lines;
}>;

export function CopyButton({
  jsonLines,
  className,
}: CopyButtonProps): Nullable<JSX.Element> {
  if (!CLIPBOARD_ENABLED) {
    useEffect(() => {
      console.warn(
        "Virtual Json Viewer: Clipboard API is not available. Copy button hidden.",
      );
    }, []);

    return null;
  }

  const t = useContext(TranslationContext);
  const { sortKeys, indentation } = useContext(SettingsContext);

  const [showSuccess, setShowSuccess] = useState(false);

  const copy = useCallback(async () => {
    try {
      const text = Json.linesToString(jsonLines, {
        sortKeys,
        space: indentation,
      });
      await navigator.clipboard.writeText(text);
      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to copy json to clipboard: ", err);
    }
  }, [jsonLines, sortKeys, indentation]);

  useEffect(() => {
    if (!showSuccess) return;

    const timerId = setTimeout(() => {
      setShowSuccess(false);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [showSuccess]);

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
        "fill-toolbar-foreground",
        { "hover:bg-toolbar-focus": !showSuccess },
        className,
      )}
      title={t.toolbar.copy}
      aria-label={t.toolbar.copy}
      icon={showSuccess ? Icon.Check : Icon.Files}
      onClick={copy}
      disabled={showSuccess}
    />
  );
}
