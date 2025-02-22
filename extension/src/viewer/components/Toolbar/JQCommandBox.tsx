import { Icon, IconButton } from "@/viewer/components";
import {
  CHORD_KEY,
  KeydownEvent,
  isUpperCaseKeypress,
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

        <IconButton
          className="fill-input-foreground hover:bg-input-focus h-5 w-5"
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
  window.open("https://stedolan.github.io/jq/manual/v1.6/", "_blank");
}
