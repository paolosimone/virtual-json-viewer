import { Dispatch, FormEvent, SetStateAction, useEffect, useRef } from "react";
import { Search } from "../commons/Search";

const TYPING_DELAY = 300;

export type SearchBoxProps = {
  search: Search;
  setSearch: Dispatch<SetStateAction<Search>>;
};

export function SearchBox({ search, setSearch }: SearchBoxProps): JSX.Element {
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
    <span>
      <InputSearch text={search.text} setText={setText} />
      <ToggleShowMismatch
        showMismatch={search.showMismatch}
        toggleShowMismatch={toggleShowMismatch}
      />
    </span>
  );
}

type InputSearchProps = {
  text: string;
  setText: (text: string) => void;
};

function InputSearch({ text, setText }: InputSearchProps): JSX.Element {
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
      className="border"
      onChange={onChange}
      placeholder="search"
    />
  );
}

type ToggleShowMismatchProps = {
  showMismatch: boolean;
  toggleShowMismatch: () => void;
};

function ToggleShowMismatch({
  showMismatch,
  toggleShowMismatch,
}: ToggleShowMismatchProps): JSX.Element {
  return (
    <button onClick={toggleShowMismatch}>hide:{String(!showMismatch)}</button>
  );
}
