import classNames from "classnames";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Icon, IconButton, IconLabel } from "viewer/components";
import { CHORD_KEY, KeydownEvent, useGlobalKeydownEvent } from "viewer/hooks";
import { TranslationContext } from "viewer/localization";
import { Search, SettingsContext } from "viewer/state";

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
      showMismatch: !search.showMismatch,
    }));
  }

  const isEmpty = search.text === "";

  return (
    <span
      className={classNames(
        "flex items-center pr-1 rounded border border-viewer-background bg-viewer-background text-viewer-foreground",
        className
      )}
    >
      {isEmpty ? (
        <IconLabel
          className="w-5 h-5 ml-1 mr-2 fill-viewer-foreground"
          icon={Icon.Search}
        />
      ) : (
        <IconButton
          className="w-5 h-5 ml-1 mr-2 fill-viewer-foreground hover:bg-viewer-focus"
          title={t.toolbar.search.clear}
          icon={Icon.Close}
          onClick={clearSearch}
        />
      )}

      <SearchInput
        className="flex-1 bg-inherit placeholder-viewer-foreground/50"
        text={search.text}
        setText={setText}
      />

      {!disableShowMismatch && (
        <IconButton
          className={classNames(
            "w-6 h-6 fill-viewer-foreground hover:bg-viewer-focus",
            { "bg-viewer-focus/50": !search.showMismatch }
          )}
          title={t.toolbar.search.hideMismatch}
          icon={Icon.EyeClosed}
          onClick={toggleShowMismatch}
        />
      )}

      <IconButton
        className={classNames(
          "w-6 h-6 ml-1 fill-viewer-foreground hover:bg-viewer-focus",
          { "bg-viewer-focus/50": search.caseSensitive }
        )}
        title={t.toolbar.search.caseSensitive}
        icon={Icon.CaseSensitive}
        onClick={toggleCaseSensitive}
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
  const t = useContext(TranslationContext);
  const { searchDelay } = useContext(SettingsContext);

  // throttle onChange event to wait until user stop typing
  let timeoutId: Nullable<NodeJS.Timeout> = null;

  const maybeClearTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  // clear timeout on component unmount
  useEffect(() => maybeClearTimeout);

  const onChange = (e: FormEvent<HTMLInputElement>) => {
    maybeClearTimeout();
    const text = (e.target as HTMLInputElement).value;
    timeoutId = setTimeout(() => setText(text), searchDelay);
  };

  const ref = useRef<HTMLInputElement>(null);

  // restore the input element internal state on rerender
  useEffect(() => {
    if (ref.current) {
      ref.current.value = text;
    }
  }, [ref, text]);

  // override browser search shortcut
  const handleShortcut = useCallback(
    (e: KeydownEvent) => {
      if ((e[CHORD_KEY] && e.key == "f") || e.key == "/") {
        e.preventDefault();
        ref.current?.focus();
      }
    },
    [ref]
  );
  useGlobalKeydownEvent(handleShortcut);

  return (
    <input
      ref={ref}
      type="input"
      className={classNames("focus:outline-none", className)}
      onChange={onChange}
      placeholder={t.toolbar.search.placeholder}
    />
  );
}
