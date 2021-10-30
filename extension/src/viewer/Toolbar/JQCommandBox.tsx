import classNames from "classnames";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { JQCommand } from "viewer/commons/JQCommand";
import { Icon, IconButton } from "viewer/components";

export type JQCommandBoxProps = Props<{
  command: JQCommand;
  setCommand: Dispatch<SetStateAction<JQCommand>>;
}>;

export function JQCommandBox({
  command,
  setCommand,
}: JQCommandBoxProps): JSX.Element {
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
    <span className="flex">
      <IconButton
        className="w-5 h-5 self-center mx-2"
        title="JQ Manual"
        icon={Icon.Question}
        onClick={openJQManual}
      />

      <span className="border rounded flex flex-1 bg-white">
        {isEmpty ? (
          <label className="mx-1 mr-2 select-none">jq</label>
        ) : (
          <IconButton
            className="w-5 h-5 ml-1 mr-2 self-center"
            title="Clear"
            icon={Icon.Close}
            onClick={clearFilter}
          />
        )}

        <FilterInput
          className="flex-1"
          filter={filter}
          setFilter={setFilter}
          onSubmit={applyFilter}
        />

        <IconButton
          className="w-5 h-5 self-center"
          title="Apply filter"
          icon={Icon.Run}
          onClick={applyFilter}
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
