import { Dispatch, FormEvent, SetStateAction, useEffect } from "react";
import { Search } from "../commons/Controls";

const TYPING_DELAY = 300;

export type SearchBoxProps = {
  setSearch: Dispatch<SetStateAction<Search>>;
};

export function SearchBox({ setSearch }: SearchBoxProps): JSX.Element {
  const onChange = useThrottledSearchTextUpdate(setSearch);
  return <input type="search" className="border" onChange={onChange}></input>;
}

function useThrottledSearchTextUpdate(
  setSearch: Dispatch<SetStateAction<Search>>
) {
  let timeoutId: Nullable<NodeJS.Timeout> = null;

  const maybeClearTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  useEffect(() => maybeClearTimeout);

  return (e: FormEvent<HTMLInputElement>) => {
    maybeClearTimeout();

    const text = (e.target as HTMLInputElement).value;

    timeoutId = setTimeout(
      () => setSearch((search: Search) => ({ ...search, text: text })),
      TYPING_DELAY
    );
  };
}
