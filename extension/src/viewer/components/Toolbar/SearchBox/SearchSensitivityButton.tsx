import { Icon, IconButton } from "@/viewer/components";
import { TranslationContext } from "@/viewer/localization";
import classNames from "classnames";
import { Dispatch, JSX, useContext } from "react";

export type SearchSensitivityToggleProps = Props<{
  caseSensitive: boolean;
  setCaseSensitive: Dispatch<boolean>;
}>;

export function SearchSensitivityToggle({
  className,
  caseSensitive,
  setCaseSensitive,
}: SearchSensitivityToggleProps): JSX.Element {
  const t = useContext(TranslationContext);
  return (
    <IconButton
      className={classNames(
        "fill-input-foreground hover:bg-input-focus",
        className,
      )}
      title={t.toolbar.search.case[caseSensitive ? "sensitive" : "insensitive"]}
      icon={caseSensitive ? Icon.CaseSensitive : Icon.CaseInsensitive}
      onClick={() => setCaseSensitive(!caseSensitive)}
    />
  );
}
