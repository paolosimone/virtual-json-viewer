import { useState } from "react";
import newJQ from "vendor/jq.wasm";
import { JQCommand } from "viewer/state";
import { Mutex, useEffectAsync } from ".";

export type JQResult = Json | Error | undefined;

export function useJQ(
  jqWasmFile: string,
  jsonText: string,
  { filter }: JQCommand
): JQResult {
  const [result, setResult] = useState<JQResult>(undefined);

  useEffectAsync(
    async (mutex: Mutex) => {
      if (!mutex.hasLock()) {
        return;
      }

      if (!filter || filter === ".") {
        setResult(undefined);
        return;
      }

      try {
        const module = { locateFile: () => jqWasmFile, noExitRuntime: false };
        const jq = await newJQ(module);
        const result = await jq.invoke(jsonText, filter);
        if (mutex.hasLock()) setResult(tryParse(result));
      } catch (e) {
        if (mutex.hasLock()) setResult(e as Error);
      }
    },
    [jqWasmFile, jsonText, filter, setResult]
  );

  return result;
}

function tryParse(jsonText: string): Result<Json> {
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    return e as Error;
  }
}
