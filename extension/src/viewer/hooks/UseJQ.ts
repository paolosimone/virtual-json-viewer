import { useState } from "react";
import newJQ from "vendor/jq.wasm";
import * as Json from "viewer/commons/Json";
import { JQCommand } from "viewer/state";
import { Mutex, useEffectAsync } from ".";

export type JQResult = Json.Root | Error | undefined;

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
        if (mutex.hasLock()) setResult(Json.tryParse(result));
      } catch (e) {
        if (mutex.hasLock()) setResult(e as Error);
      }
    },
    [jqWasmFile, jsonText, filter, setResult]
  );

  return result;
}
