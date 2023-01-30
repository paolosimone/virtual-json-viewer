import { useState } from "react";
import newJQ, { JQ } from "vendor/jq.wasm";
import * as Json from "viewer/commons/Json";
import { getURL, JQCommand } from "viewer/state";
import { Mutex, useEffectAsync, useSettings } from ".";

export type JQEnabled = boolean;
export type JQResult = Json.Root | Error | undefined;

export function useJQ(
  jsonText: string,
  { filter }: JQCommand
): [JQEnabled, JQResult] {
  const [settings] = useSettings();

  // check if wasm is enabled on first load
  const [jqEnabled, setJQEnabled] = useState<boolean>(true);

  useEffectAsync(
    async (mutex: Mutex) => {
      if (!settings.enableJQ && mutex.hasLock()) {
        setJQEnabled(false);
        return;
      }

      try {
        await loadJQ();
        if (mutex.hasLock()) setJQEnabled(true);
      } catch (e) {
        if (mutex.hasLock()) {
          console.warn(
            "Unable to load JQ, Wasm is probably disabled due to CSP. For additional info: https://github.com/WebAssembly/content-security-policy/blob/main/proposals/CSP.md"
          );
          setJQEnabled(false);
        }
      }
    },
    [settings.enableJQ, setJQEnabled]
  );

  // execute command and parse result
  const [result, setResult] = useState<JQResult>(undefined);

  useEffectAsync(
    async (mutex: Mutex) => {
      if (!mutex.hasLock()) {
        return;
      }

      if (!jqEnabled || !filter || filter === ".") {
        setResult(undefined);
        return;
      }

      try {
        const jq = await loadJQ();
        const output = await jq.invoke(jsonText, filter);
        const result = Json.tryParse(output);
        if (mutex.hasLock()) setResult(result);
      } catch (e) {
        if (mutex.hasLock()) setResult(e as Error);
      }
    },
    [jqEnabled, jsonText, filter, setResult]
  );

  return [jqEnabled, result];
}

const JQ_WASM_FILE = getURL("jq.wasm");

function loadJQ(): Promise<JQ> {
  return newJQ({
    locateFile: () => JQ_WASM_FILE,
    print: devNull,
    printErr: devNull,
    noExitRuntime: false,
  });
}

function devNull(_message: string) {
  // do nothing
}
