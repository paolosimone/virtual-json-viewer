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
import { Icon, IconButton } from "viewer/components";
import {
  CHORD_KEY,
  KeydownEvent,
  isUpperCaseKeypress,
  useGlobalKeydownEvent,
  useReactiveRef,
} from "viewer/hooks";
import { TranslationContext } from "viewer/localization";
import { JQCommand } from "viewer/state";

export type JQCommandBoxProps = Props<{
  command: JQCommand;
  setCommand: Dispatch<SetStateAction<JQCommand>>;
}>;

export function JQCommandBox({
  command,
  setCommand,
}: JQCommandBoxProps): JSX.Element {
  const t = useContext(TranslationContext);
  const [filter, setFilter] = useState(command.filter);

  function applyFilter() {
    setCommand((command: JQCommand) => ({ ...command, filter: filter }));
  }

  function clearFilter() {
    setFilter("");
    setCommand((command: JQCommand) => ({ ...command, filter: "" }));
  }

  const isEmpty = filter === "";

  return (
    <span className="flex items-center">
      <IconButton
        className="w-5 h-5 mx-2 fill-toolbar-foreground hover:bg-toolbar-focus"
        title={t.toolbar.jq.manual}
        icon={Icon.Question}
        onClick={openJQManual}
      />

      <span className="flex items-center flex-1 pr-1 rounded border border-input-background bg-input-background text-input-foreground">
        {isEmpty ? (
          <label className="mx-1 mr-2 select-none">jq</label>
        ) : (
          <IconButton
            className="w-5 h-5 ml-1 mr-2 fill-input-foreground hover:bg-input-focus"
            title={t.toolbar.jq.clear}
            icon={Icon.Close}
            onClick={clearFilter}
          />
        )}

        <FilterInput
          className="flex-1 bg-input-background placeholder-input-foreground/50"
          filter={filter}
          setFilter={setFilter}
          onSubmit={applyFilter}
        />

        <IconButton
          className="w-5 h-5 fill-input-foreground hover:bg-input-focus"
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
      className={classNames("focus:outline-none", className)}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder="."
    />
  );
}

function openJQManual() {
  window.open("https://stedolan.github.io/jq/manual/v1.6/", "_blank");
}
