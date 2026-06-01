import newJQ, { JQ } from "@/vendor/jq.wasm";
import * as Json from "@/viewer/commons/Json";
import { getURL } from "@/viewer/commons/Runtime";
import { DefaultSettings, JQCommand, useSettings } from "@/viewer/state";
import { useState } from "react";
import { Mutex, useEffectAsync } from ".";

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
  const [jqEnabled, setJQEnabled] = useState<boolean>(true);

  useEffectAsync(
    async (mutex: Mutex) => {
      if (!enableJQ && mutex.hasLock()) {
        setJQEnabled(false);
        return;
      }

      try {
        await loadJQ();
        if (mutex.hasLock()) {
          setJQEnabled(true);
        }
      } catch {
        if (mutex.hasLock()) {
          console.warn(
            "Unable to load JQ, Wasm is probably disabled due to CSP. For additional info: https://github.com/WebAssembly/content-security-policy/blob/main/proposals/CSP.md",
          );
          setJQEnabled(false);
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

      if (!jqEnabled || !command.filter) {
        setResult(undefined);
        return;
      }

      try {
        const result = await invokeJQ(jsonText, command, sortKeys);
        if (mutex.hasLock()) setResult(result);
      } catch (e) {
        if (mutex.hasLock()) setResult(e as Error);
      }
    },
    [jqEnabled, jsonText, command, sortKeys],
  );

  return [jqEnabled, result];
}

async function invokeJQ(
  jsonText: string,
  command: JQCommand,
  sortKeys: boolean,
): Promise<JQResult> {
  const jq = await loadJQ();

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
    // Clean up the runtime between calls
    noExitRuntime: false,
  });
}

function devNull(_message: string) {
  // do nothing
}
