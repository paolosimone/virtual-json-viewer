import { GlobalOptionsContext } from "@/options/Context";
import { Icon, IconLabel, Select } from "@/viewer/components";
import { DefaultSettings } from "@/viewer/state";
import classNames from "classnames";
import {
  Dispatch,
  FormEvent,
  JSX,
  useContext,
  useEffect,
  useState,
} from "react";

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
  return option === "custom" ? DefaultSettings.activationUrlRegex : null;
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
      className={classNames("bg-input-background flex items-center", className)}
    >
      <input
        type="text"
        className={classNames(
          "bg-input-background text-input-foreground border-input-focus grow border border-r-0 pl-1 focus:outline-hidden",
          className,
        )}
        value={inputRegex}
        onChange={onInputRegexChange}
      />
      <IconLabel
        className={classNames("h-5 w-5 border border-l-0", {
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
