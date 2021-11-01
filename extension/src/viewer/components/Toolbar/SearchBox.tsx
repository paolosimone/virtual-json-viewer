import classNames from "classnames";
import { Dispatch, FormEvent, SetStateAction, useEffect, useRef } from "react";
import { Icon, IconButton, IconLabel } from "viewer/components";
import { Search } from "../../commons/state";

// TODO setting typing delay
const TYPING_DELAY = 300;

export type SearchBoxProps = Props<{
  search: Search;
  setSearch: Dispatch<SetStateAction<Search>>;
  disableShowMismatch?: boolean;
}>;

export function SearchBox({
  search,
  setSearch,
  className,
  disableShowMismatch,
}: SearchBoxProps): JSX.Element {
  function setText(text: string) {
    setSearch((search: Search) => ({ ...search, text: text }));
  }

  function clearSearch() {
    setText("");
  }

  function toggleShowMismatch() {
    setSearch((search: Search) => ({
      ...search,
      showMismatch: !search.showMismatch,
    }));
  }

  const isEmpty = search.text === "";

  return (
    <span
      className={classNames(
        "flex items-center pr-1 border rounded border-gray-200 dark:border-gray-500 bg-white dark:bg-gray-400",
        className
      )}
    >
      {isEmpty ? (
        <IconLabel
          className="w-5 h-5 ml-1 mr-2"
          icon={Icon.Search}
          dark={false}
        />
      ) : (
        <IconButton
          className="w-5 h-5 ml-1 mr-2"
          title="Clear"
          icon={Icon.Close}
          onClick={clearSearch}
          dark={false}
        />
      )}

      <SearchInput
        className="flex-1 dark:bg-gray-400 dark:placeholder-gray-700"
        text={search.text}
        setText={setText}
      />

      {!disableShowMismatch && (
        <IconButton
          className="w-6 h-6"
          title="Hide mismatch"
          icon={Icon.EyeClosed}
          onClick={toggleShowMismatch}
          isActive={!search.showMismatch}
          dark={false}
        />
      )}
    </span>
  );
}

type SearchInputProps = Props<{
  text: string;
  setText: (text: string) => void;
}>;

function SearchInput({
  text,
  setText,
  className,
}: SearchInputProps): JSX.Element {
  // throttle onChange event to wait until user stop typing
  let timeoutId: Nullable<NodeJS.Timeout> = null;

  const maybeClearTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  useEffect(() => maybeClearTimeout);

  const onChange = (e: FormEvent<HTMLInputElement>) => {
    maybeClearTimeout();
    const text = (e.target as HTMLInputElement).value;
    timeoutId = setTimeout(() => setText(text), TYPING_DELAY);
  };

  // restore the input element internal state on rerender
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.value = text;
    }
  }, [ref, text]);

  return (
    <input
      ref={ref}
      type="input"
      className={classNames("focus:outline-none", className)}
      onChange={onChange}
      placeholder="search"
    />
  );
}
