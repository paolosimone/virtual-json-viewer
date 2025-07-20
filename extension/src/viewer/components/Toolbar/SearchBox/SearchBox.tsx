import { Search } from "@/viewer/state";
import classNames from "classnames";
import { Dispatch, JSX, SetStateAction } from "react";
import { SearchClearButton } from "./SearchClearButton";
import { SearchInput } from "./SearchInput";
import { SearchSensitivityToggle } from "./SearchSensitivityButton";
import { SearchVisibilityToggle } from "./SearchVisibilityButton";

export type SearchBoxProps = Props<{
  search: Search;
  setSearch: Dispatch<SetStateAction<Search>>;
  enableVisibility: boolean;
}>;

export function SearchBox({
  search,
  setSearch,
  className,
  enableVisibility,
}: SearchBoxProps): JSX.Element {
  function updateSearch(update: Partial<Search>) {
    setSearch((prevSearch) => ({ ...prevSearch, ...update }));
  }

  return (
    <span
      className={classNames(
        "border-input-background bg-input-background text-input-foreground flex items-center rounded-sm border pr-1",
        className,
      )}
    >
      <SearchClearButton
        className="mr-2 ml-1 h-5 w-5"
        isEmpty={search.text === ""}
        clearSearch={() => updateSearch({ text: "" })}
      />

      <SearchInput
        className="flex-1 bg-inherit"
        text={search.text}
        setText={(text) => updateSearch({ text })}
      />

      {enableVisibility && (
        <SearchVisibilityToggle
          className="h-6 w-6"
          visibility={search.visibility}
          setVisibility={(visibility) => updateSearch({ visibility })}
        />
      )}

      <SearchSensitivityToggle
        className="ml-1 h-6 w-6"
        caseSensitive={search.caseSensitive}
        setCaseSensitive={(caseSensitive) => updateSearch({ caseSensitive })}
      />
    </span>
  );
}
