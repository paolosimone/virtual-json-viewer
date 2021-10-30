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
  className,
}: JQCommandBoxProps): JSX.Element {
  const [filter, setFilter] = useState(command.filter);

  function applyFilter() {
    setCommand((command: JQCommand) => ({ ...command, filter: filter }));
  }

  return (
    <span className="flex">
      <label className="mx-4 ">jq</label>
      <span
        className={classNames("border rounded flex flex-1 bg-white", className)}
      >
        <FilterInput
          className="flex-1"
          filter={filter}
          setFilter={setFilter}
          onSubmit={applyFilter}
        />
        <IconButton
          className="w-5 h-5"
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
