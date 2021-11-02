import classNames from "classnames";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Icon, IconButton } from "viewer/components";
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
        className="w-5 h-5 mx-2"
        title={t.toolbar.jq.manual}
        icon={Icon.Question}
        onClick={openJQManual}
      />

      <span className="flex items-center flex-1 pr-1 border rounded border-gray-200 dark:border-gray-500 bg-white dark:bg-gray-400">
        {isEmpty ? (
          <label className="mx-1 mr-2 select-none">jq</label>
        ) : (
          <IconButton
            className="w-5 h-5 ml-1 mr-2"
            title={t.toolbar.jq.clear}
            icon={Icon.Close}
            onClick={clearFilter}
            dark={false}
          />
        )}

        <FilterInput
          className="flex-1 dark:bg-gray-400 dark:placeholder-gray-700"
          filter={filter}
          setFilter={setFilter}
          onSubmit={applyFilter}
        />

        <IconButton
          className="w-5 h-5"
          title={t.toolbar.jq.run}
          icon={Icon.Run}
          onClick={applyFilter}
          dark={false}
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
  // restore the input element internal state on rerender
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.value = filter;
    }
  }, [ref, filter]);

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
