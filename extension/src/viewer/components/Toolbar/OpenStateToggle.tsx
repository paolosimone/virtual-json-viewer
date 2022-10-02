import { useCallback, useContext } from "react";
import { dispatch, EventType } from "viewer/commons/EventBus";
import { Icon, IconButton } from "viewer/components";
import { CHORD_KEY, useGlobalKeydownEvent } from "viewer/hooks";
import { TranslationContext } from "viewer/localization";

export type OpenStateToggleProps = BaseProps;

export function OpenStateToggle({
  className,
}: OpenStateToggleProps): JSX.Element {
  const t = useContext(TranslationContext);

  // register global shortcut
  const handleShortcut = useCallback((e: KeyboardEvent) => {
    if (e[CHORD_KEY] && e.key == "e") {
      e.preventDefault();
      expand();
    }
    if (e[CHORD_KEY] && e.shiftKey && e.key == "e") {
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
        className="w-1/2"
      />

      <IconButton
        title={t.toolbar.collapse}
        icon={Icon.CollapseAll}
        onClick={collapse}
        className="w-1/2"
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
