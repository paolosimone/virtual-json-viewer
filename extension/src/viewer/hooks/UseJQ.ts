import { useState } from "react";
import newJQ, { JQ } from "vendor/jq.wasm";
import * as Json from "viewer/commons/Json";
import { JQCommand } from "viewer/state";
import { Mutex, useEffectAsync } from ".";

export type JQEnabled = boolean;
export type JQResult = Json.Root | Error | undefined;

export function useJQ(
  jqWasmFile: string,
  jsonText: string,
  { filter }: JQCommand
): [JQEnabled, JQResult] {
  // check if wasm is enabled on first load
  const [jqEnabled, setJQEnabled] = useState<boolean>(true);

  useEffectAsync(
    async (mutex: Mutex) => {
      try {
        await loadJQ(jqWasmFile);
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
    [jqWasmFile, setJQEnabled]
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
        const jq = await loadJQ(jqWasmFile);
        const result = await jq.invoke(jsonText, filter);
        if (mutex.hasLock()) setResult(Json.tryParse(result));
      } catch (e) {
        if (mutex.hasLock()) setResult(e as Error);
      }
    },
    [jqEnabled, jqWasmFile, jsonText, filter, setResult]
  );

  return [jqEnabled, result];
}

function loadJQ(jqWasmFile: string): Promise<JQ> {
  return newJQ({
    locateFile: () => jqWasmFile,
    print: devNull,
    printErr: devNull,
    noExitRuntime: false,
  });
}

function devNull(_message: string) {
  // do nothing
}
