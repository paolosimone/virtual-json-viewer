import { EventType, dispatch } from "@/viewer/commons/EventBus";
import { Icon, IconButton } from "@/viewer/components";
import {
  CHORD_KEY,
  KeydownEvent,
  isUpperCaseKeypress,
  useGlobalKeydownEvent,
} from "@/viewer/hooks";
import { TranslationContext } from "@/viewer/localization";
import { JSX, useCallback, useContext } from "react";

export type OpenStateToggleProps = BaseProps;

export function OpenStateToggle({
  className,
}: OpenStateToggleProps): JSX.Element {
  const t = useContext(TranslationContext);

  // register global shortcut
  const handleShortcut = useCallback((e: KeydownEvent) => {
    if (e[CHORD_KEY] && e.key == "e") {
      e.preventDefault();
      expand();
    }
    if (e[CHORD_KEY] && isUpperCaseKeypress(e, "E")) {
      e.preventDefault();
      collapse();
    }
  }, []);
  useGlobalKeydownEvent(handleShortcut);

  return (
    <span className={className}>
      <IconButton
        title={t.toolbar.expand}
        icon={Icon.ExpandAll}
        onClick={expand}
        className="fill-toolbar-foreground hover:bg-toolbar-focus w-1/2"
      />

      <IconButton
        title={t.toolbar.collapse}
        icon={Icon.CollapseAll}
        onClick={collapse}
        className="fill-toolbar-foreground hover:bg-toolbar-focus w-1/2"
      />
    </span>
  );
}

function expand() {
  dispatch(EventType.Expand);
}

function collapse() {
  dispatch(EventType.Collapse);
}
