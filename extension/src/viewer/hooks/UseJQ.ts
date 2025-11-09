import newJQ, { JQ } from "@/vendor/jq.wasm";
import * as Json from "@/viewer/commons/Json";
import {
  DefaultSettings,
  getURL,
  JQCommand,
  useSettings,
} from "@/viewer/state";
import { useState } from "react";
import { Mutex, useEffectAsync, useReactiveRef } from ".";

export type JQEnabled = boolean;
export type JQResult = Json.Lines | Error | undefined;

export function useJQ(
  jsonText: string,
  command: JQCommand,
): [JQEnabled, JQResult] {
  // it's called outside settings context
  const [settings] = useSettings();
  const { enableJQ, sortKeys } = settings ?? DefaultSettings;

  // check if wasm is enabled on first load
  const [jq, setJQ] = useReactiveRef<JQ>();

  useEffectAsync(
    async (mutex: Mutex) => {
      if (!enableJQ && mutex.hasLock()) {
        setJQ(null);
        return;
      }

      try {
        const jqCurrent = await loadJQ();
        if (mutex.hasLock()) {
          setJQ(jqCurrent);
        }
      } catch {
        if (mutex.hasLock()) {
          console.warn(
            "Unable to load JQ, Wasm is probably disabled due to CSP. For additional info: https://github.com/WebAssembly/content-security-policy/blob/main/proposals/CSP.md",
          );
          setJQ(null);
        }
      }
    },
    [enableJQ],
  );

  // execute command and parse result
  const [result, setResult] = useState<JQResult>(undefined);

  useEffectAsync(
    async (mutex: Mutex) => {
      if (!mutex.hasLock()) {
        return;
      }

      if (!jq || !command.filter) {
        setResult(undefined);
        return;
      }

      try {
        const result = await invokeJQ(jq, jsonText, command, sortKeys);
        if (mutex.hasLock()) setResult(result);
      } catch (e) {
        if (mutex.hasLock()) setResult(e as Error);
      }
    },
    [jq, jsonText, command, sortKeys],
  );

  const jqEnabled = jq !== null;
  return [jqEnabled, result];
}

async function invokeJQ(
  jq: JQ,
  jsonText: string,
  command: JQCommand,
  sortKeys: boolean,
): Promise<JQResult> {
  // One JSON per line in output
  const options = ["--compact-output"];
  // Whole input text as array, if multiline
  if (command.slurp) options.push("--slurp");

  const output = await jq.invoke(jsonText, command.filter, options);

  return Json.tryParseLines(output, { sortKeys });
}

function loadJQ(): Promise<JQ> {
  return newJQ({
    locateFile: () => getURL("assets/jq.wasm"),
    print: devNull,
    printErr: devNull,
    noExitRuntime: true,
  });
}

function devNull(_message: string) {
  // do nothing
}
