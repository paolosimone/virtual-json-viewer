import classNames from "classnames";
import { GlobalOptionsContext } from "options/Context";
import { Dispatch, FormEvent, useContext, useEffect, useState } from "react";
import { Icon, IconLabel, Select } from "viewer/components";

export type ForceActivationSelectProps = Props<{
  urlRegex: Nullable<string>;
  setUrlRegex: Dispatch<Nullable<string>>;
}>;

export function ForceActivationSelect({
  urlRegex,
  setUrlRegex,
  className,
}: ForceActivationSelectProps): JSX.Element {
  const { t } = useContext(GlobalOptionsContext);

  const options = SORTED_OPTIONS.map((name) => ({
    value: name,
    label: t.settings.forceActivation[name],
  }));

  const switchOption = (option: Option) => {
    setUrlRegex(optionToDefaultRegex(option));
  };

  return (
    <div className={classNames(className, "flex flex-col gap-1")}>
      <Select
        options={options}
        selected={regexToOption(urlRegex)}
        setValue={switchOption}
      />

      {urlRegex !== null && (
        <UrlRegexInput urlRegex={urlRegex} setUrlRegex={setUrlRegex} />
      )}
    </div>
  );
}

type Option = "no" | "custom";
const SORTED_OPTIONS: Option[] = ["no", "custom"];

function regexToOption(urlRegex: Nullable<string>): Option {
  return urlRegex ? "custom" : "no";
}

function optionToDefaultRegex(option: Option): Nullable<string> {
  return option === "custom" ? ".*" : null;
}

type UrlRegexInputProps = Props<{
  urlRegex: string;
  setUrlRegex: Dispatch<string>;
}>;

function UrlRegexInput({
  urlRegex,
  setUrlRegex,
  className,
}: UrlRegexInputProps): JSX.Element {
  const [inputRegex, setInputRegex] = useState("");

  // props are refeshed on settings load
  useEffect(() => {
    if (urlRegex) setInputRegex(urlRegex);
  }, [urlRegex]);

  const onInputRegexChange = (e: FormEvent<HTMLInputElement>) => {
    const newRegex = (e.target as HTMLInputElement).value;
    setInputRegex(newRegex);
    if (isValidRegex(newRegex)) setUrlRegex(newRegex);
  };

  const isValidInputRegex = isValidRegex(inputRegex);

  return (
    <span
      className={classNames("flex items-center bg-input-background", className)}
    >
      <input
        type="text"
        className={classNames(
          "grow pl-1 bg-input-background text-input-foreground border border-r-0 border-input-focus focus:outline-none",
          className,
        )}
        value={inputRegex}
        onChange={onInputRegexChange}
      />
      <IconLabel
        className={classNames("w-5 h-5 border border-l-0", {
          "fill-green-800": isValidInputRegex,
          "fill-red-800": !isValidInputRegex,
        })}
        icon={isValidInputRegex ? Icon.Pass : Icon.Error}
      />
    </span>
  );
}

function isValidRegex(text: string): boolean {
  if (text === "") {
    return false;
  }

  try {
    new RegExp(text);
    return true;
  } catch {
    return false;
  }
}
