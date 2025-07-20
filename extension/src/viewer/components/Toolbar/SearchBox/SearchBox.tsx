import { Search, SearchNavigation } from "@/viewer/state";
import classNames from "classnames";
import { Dispatch, JSX, SetStateAction } from "react";
import { SearchClearButton } from "./SearchClearButton";
import { SearchInput } from "./SearchInput";
import { SearchNavigationPanel } from "./SearchNavigationPanel";
import { SearchSensitivityToggle } from "./SearchSensitivityButton";
import { SearchVisibilityToggle } from "./SearchVisibilityButton";

export type SearchBoxProps = Props<{
  search: Search;
  setSearch: Dispatch<SetStateAction<Search>>;
  navigation: SearchNavigation;
  setNavigation: Dispatch<SetStateAction<SearchNavigation>>;
  enableVisibility: boolean;
}>;

export function SearchBox({
  className,
  search,
  setSearch,
  navigation,
  setNavigation,
  enableVisibility,
}: SearchBoxProps): JSX.Element {
  function updateSearch(update: Partial<Search>) {
    setSearch((prevSearch) => ({ ...prevSearch, ...update }));
  }

  function updateNavigation(update: Partial<SearchNavigation>) {
    setNavigation((prevNavigation) => ({ ...prevNavigation, ...update }));
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

      {navigation.totalCount !== null && (
        <SearchNavigationPanel
          className="mx-3 h-6"
          currentIndex={navigation.currentIndex}
          totalCount={navigation.totalCount}
          setCurrentIndex={(currentIndex) => updateNavigation({ currentIndex })}
        />
      )}

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
