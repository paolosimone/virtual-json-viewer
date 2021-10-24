import classNames from "classnames";
import { Dispatch, FormEvent, SetStateAction, useEffect, useRef } from "react";
import { Icon, IconButton } from "viewer/components";
import { Search } from "../commons/Search";

const TYPING_DELAY = 300;

export type SearchBoxProps = Props<{
  search: Search;
  setSearch: Dispatch<SetStateAction<Search>>;
}>;

export function SearchBox({
  search,
  setSearch,
  className,
}: SearchBoxProps): JSX.Element {
  function setText(text: string) {
    setSearch((search: Search) => ({ ...search, text: text }));
  }

  function toggleShowMismatch() {
    setSearch((search: Search) => ({
      ...search,
      showMismatch: !search.showMismatch,
    }));
  }

  return (
    <span className={classNames("border rounded flex bg-white", className)}>
      <SearchInput className="flex-1" text={search.text} setText={setText} />
      <IconButton
        className="w-7 h-7 px-0.5"
        title="Hide mismatch"
        icon={Icon.EyeClosed}
        onClick={toggleShowMismatch}
        isActive={!search.showMismatch}
      />
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
      type="search"
      className={classNames("focus:outline-none", className)}
      onChange={onChange}
      placeholder="search"
    />
  );
}
