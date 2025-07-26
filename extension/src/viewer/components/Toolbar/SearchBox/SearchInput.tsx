import { isActiveElementEditable } from "@/viewer/commons/Dom";
import {
  CHORD_KEY,
  KeydownEvent,
  useGlobalKeydownEvent,
  useReactiveRef,
} from "@/viewer/hooks";
import { TranslationContext } from "@/viewer/localization";
import { SettingsContext } from "@/viewer/state";
import classNames from "classnames";
import { FormEvent, JSX, useCallback, useContext, useEffect } from "react";

type SearchInputProps = Props<{
  text: string;
  setText: (text: string) => void;
}>;

export function SearchInput({
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
      if (
        (e[CHORD_KEY] && e.key === "f") ||
        (e.key === "/" && !isActiveElementEditable())
      ) {
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
      className={classNames(
        "placeholder-input-foreground/50 focus:outline-hidden",
        className,
      )}
      onChange={onChange}
      placeholder={t.toolbar.search.placeholder}
    />
  );
}

// TODO enter goto next
