import classNames from "classnames";
import {
  Dispatch,
  FormEvent,
  JSX,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { Icon, IconButton, IconLabel } from "@/viewer/components";
import {
  CHORD_KEY,
  KeydownEvent,
  useGlobalKeydownEvent,
  useReactiveRef,
} from "@/viewer/hooks";
import { TranslationContext } from "@/viewer/localization";
import { Search, SearchVisibility, SettingsContext } from "@/viewer/state";

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
  const t = useContext(TranslationContext);

  function setText(text: string) {
    setSearch((search: Search) => ({ ...search, text: text }));
  }

  function clearSearch() {
    setText("");
  }

  function toggleCaseSensitive() {
    setSearch((search: Search) => ({
      ...search,
      caseSensitive: !search.caseSensitive,
    }));
  }

  function toggleShowMismatch() {
    setSearch((search: Search) => ({
      ...search,
      visibility: nextSearchMismatch(search.visibility),
    }));
  }

  const isEmpty = search.text === "";

  return (
    <span
      className={classNames(
        "flex items-center pr-1 rounded-sm border border-input-background bg-input-background text-input-foreground",
        className,
      )}
    >
      {isEmpty ? (
        <IconLabel
          className="w-5 h-5 ml-1 mr-2 fill-input-foreground"
          icon={Icon.Search}
        />
      ) : (
        <IconButton
          className="w-5 h-5 ml-1 mr-2 fill-input-foreground hover:bg-input-focus"
          title={t.toolbar.search.clear}
          icon={Icon.Close}
          onClick={clearSearch}
        />
      )}

      <SearchInput
        className="flex-1 bg-inherit placeholder-input-foreground/50"
        text={search.text}
        setText={setText}
      />

      {!disableShowMismatch && (
        <IconButton
          className={classNames(
            "w-6 h-6 fill-input-foreground hover:bg-input-focus",
          )}
          title={t.toolbar.search.visibility[search.visibility]}
          icon={SEARCH_MISMATCH_ICONS[search.visibility]}
          onClick={toggleShowMismatch}
        />
      )}

      <IconButton
        className={classNames(
          "w-6 h-6 ml-1 fill-input-foreground hover:bg-input-focus",
        )}
        title={
          t.toolbar.search.case[
            search.caseSensitive ? "sensitive" : "insensitive"
          ]
        }
        icon={search.caseSensitive ? Icon.CaseSensitive : Icon.CaseInsensitive}
        onClick={toggleCaseSensitive}
      />
    </span>
  );
}

const SEARCH_MISMATCH_ICONS: Record<SearchVisibility, Icon.Icon> = {
  [SearchVisibility.All]: Icon.Eye,
  [SearchVisibility.Subtree]: Icon.EyeClosed,
  [SearchVisibility.Match]: Icon.EyeClosedCross,
};

function nextSearchMismatch(current: SearchVisibility): SearchVisibility {
  const values = Object.values(SearchVisibility);
  return values[(values.indexOf(current) + 1) % values.length];
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
  const t = useContext(TranslationContext);
  const { searchDelay } = useContext(SettingsContext);

  const [current, ref] = useReactiveRef<HTMLInputElement>();

  // restore the input element internal state on rerender
  if (current) current.value = text;

  // debounce onChange event to wait until user stops typing
  let timeoutId: Nullable<NodeJS.Timeout> = null;

  const maybeClearTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  // clear timeout on component unmount
  useEffect(() => maybeClearTimeout, []);

  const onChange = (e: FormEvent<HTMLInputElement>) => {
    maybeClearTimeout();
    const text = (e.target as HTMLInputElement).value;
    timeoutId = setTimeout(() => setText(text), searchDelay);
  };

  // override browser search shortcut
  const handleShortcut = useCallback(
    (e: KeydownEvent) => {
      if (document.activeElement === current) {
        return;
      }

      if ((e[CHORD_KEY] && e.key === "f") || e.key === "/") {
        e.preventDefault();
        current?.focus();
      }
    },
    [current],
  );
  useGlobalKeydownEvent(handleShortcut);

  return (
    <input
      ref={ref}
      type="input"
      className={classNames("focus:outline-hidden", className)}
      onChange={onChange}
      placeholder={t.toolbar.search.placeholder}
    />
  );
}
