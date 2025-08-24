import {
  EnterNodeEvent,
  NodePath,
  ViewerEventType,
} from "@/viewer/commons/EventBus";
import { Icon, IconButton } from "@/viewer/components";
import {
  CHORD_KEY,
  isUpperCaseKeypress,
  KeydownEvent,
  updateField,
  useEventBusListener,
  useGlobalKeydownEvent,
  useReactiveRef,
} from "@/viewer/hooks";
import { TranslationContext } from "@/viewer/localization";
import { JQCommand } from "@/viewer/state";
import classNames from "classnames";
import {
  Dispatch,
  FormEvent,
  JSX,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from "react";

export type JQCommandBoxProps = Props<{
  command: JQCommand;
  setCommand: Dispatch<SetStateAction<JQCommand>>;
  isMultilineOutput: boolean;
}>;

export function JQCommandBox({
  command,
  setCommand,
  isMultilineOutput,
}: JQCommandBoxProps): JSX.Element {
  const t = useContext(TranslationContext);
  const [filter, setFilter] = useState(command.filter);

  function setCommandFilter(value: string) {
    setCommand(updateField("filter", value));
  }

  const applyFilter = () => setCommandFilter(filter);

  function clearFilter() {
    setFilter("");
    setCommandFilter("");
  }

  // Listen to enter node event
  const onEnterNode = useCallback(
    (event: EnterNodeEvent) => {
      const newFilter = enterNodeFilter(command, event.path, isMultilineOutput);
      setFilter(newFilter);
      setCommandFilter(newFilter);
    },
    [command, isMultilineOutput],
  );
  useEventBusListener(ViewerEventType.EnterNode, onEnterNode);

  const isEmpty = filter === "";

  return (
    <span className="flex items-center">
      <IconButton
        className="fill-toolbar-foreground hover:bg-toolbar-focus mx-2 h-5 w-5"
        title={t.toolbar.jq.manual}
        icon={Icon.Question}
        onClick={openJQManual}
      />

      <span className="border-input-background bg-input-background text-input-foreground flex flex-1 items-center rounded-sm border pr-1">
        {isEmpty ? (
          <label className="mx-1 mr-2 select-none">jq</label>
        ) : (
          <IconButton
            className="fill-input-foreground hover:bg-input-focus mr-2 ml-1 h-5 w-5"
            title={t.toolbar.jq.clear}
            icon={Icon.Close}
            onClick={clearFilter}
          />
        )}

        <FilterInput
          className="bg-input-background placeholder-input-foreground/50 flex-1"
          filter={filter}
          setFilter={setFilter}
          onSubmit={applyFilter}
        />

        {command.slurp !== null && (
          <IconButton
            className="fill-input-foreground hover:bg-input-focus mx-1 h-5 w-5"
            title={t.toolbar.jq.slurp[command.slurp ? "on" : "off"]}
            icon={command.slurp ? Icon.SymbolFile : Icon.Files}
            onClick={() => setCommand(updateField("slurp", !command.slurp))}
          />
        )}

        <IconButton
          className="fill-input-foreground hover:bg-input-focus h-6 w-6"
          title={t.toolbar.jq.run}
          icon={Icon.Run}
          onClick={applyFilter}
          tabIndex={-1}
        />
      </span>
    </span>
  );
}

type FilterInputProps = Props<{
  filter: string;
  setFilter: (text: string) => void;
  onSubmit: () => void;
}>;

function FilterInput({
  filter,
  setFilter,
  onSubmit,
  className,
}: FilterInputProps): JSX.Element {
  const [current, ref] = useReactiveRef<HTMLInputElement>();

  // restore the input element internal state on rerender
  if (current) current.value = filter;

  // register global shortcut
  const handleShortcut = useCallback(
    (e: KeydownEvent) => {
      if (e[CHORD_KEY] && isUpperCaseKeypress(e, "F")) {
        e.preventDefault();
        current?.focus();
      }
    },
    [current],
  );
  useGlobalKeydownEvent(handleShortcut);

  const onChange = (e: FormEvent<HTMLInputElement>) => {
    const text = (e.target as HTMLInputElement).value.trim();
    setFilter(text);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <input
      ref={ref}
      type="input"
      className={classNames("focus:outline-hidden", className)}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder="."
    />
  );
}

function openJQManual() {
  window.open("https://jqlang.org/manual/v1.8/", "_blank");
}

function enterNodeFilter(
  command: JQCommand,
  nodePath: NodePath,
  isMultilineOutput: boolean,
): string {
  // If input JSON is multiline but slurp is off, the array root key must be removed.
  // The filter will be applied to each line independently.
  // Example: .[0].key  ->  .key
  const applyToEachLine = command.slurp === false;
  if (applyToEachLine) {
    nodePath = nodePath.slice(1);
  }

  // Defensive to avoid keep adding "| ."
  if (!nodePath.length) {
    return command.filter || ".";
  }

  // Build the jq filter for the node path
  const nodeFilter = nodePath.map(jsonKeyToJQ).join(".");

  // If no filter is set, just return the node filter.
  if (!command.filter) {
    return `.${nodeFilter}`;
  }

  // If output JSON is multiline, existing filter must be wrapped in array.
  /// ...Unless input JSON is already multiline and slurp is off.
  const wrapInArray = isMultilineOutput && !applyToEachLine;
  const commandfilter = wrapInArray ? `[${command.filter}]` : command.filter;
  return `${commandfilter} | .${nodeFilter}`;
}

function jsonKeyToJQ(key: string | number): string {
  return typeof key === "number" ? `[${key}]` : JSON.stringify(key);
}
