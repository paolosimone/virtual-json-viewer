import React, { FormEvent, useEffect } from "react";

const TYPING_DELAY = 300;

export type SearchBoxProps = {
  onSearch: (search: string) => void;
};

export function SearchBox({ onSearch }: SearchBoxProps): JSX.Element {
  let timeoutId: Nullable<NodeJS.Timeout> = null;

  const maybeClearTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  const onChange = (e: FormEvent<HTMLInputElement>) => {
    maybeClearTimeout();
    const search = (e.target as HTMLInputElement).value;
    timeoutId = setTimeout(() => onSearch(search), TYPING_DELAY);
  };

  useEffect(() => maybeClearTimeout);

  // TODO style
  return <input type="search" className="border" onChange={onChange}></input>;
}
