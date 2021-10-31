import { useEffect, useState } from "react";
import newJQ from "vendor/jq.wasm";
import { JQCommand } from "viewer/commons/state";

export type JQResult = Json | Error | undefined;

export function useJQ(
  jqWasmFile: string,
  jsonText: string,
  { filter }: JQCommand
): JQResult {
  const [result, setResult] = useState<JQResult>(jsonText);

  useEffect(() => {
    if (!filter || filter === ".") {
      setResult(undefined);
      return;
    }

    // acquire lock to prevent race conditions
    let lock = true;

    async function applyFilterAsync() {
      try {
        const module = { locateFile: () => jqWasmFile, noExitRuntime: false };
        const jq = await newJQ(module);
        const result = await jq.invoke(jsonText, filter);
        if (lock) setResult(tryParse(result));
      } catch (e) {
        if (lock) setResult(e as Error);
      }
    }

    applyFilterAsync();

    // release lock on cleanup
    return () => {
      lock = false;
    };
  }, [jqWasmFile, jsonText, filter, setResult]);

  return result;
}

function tryParse(jsonText: string): Result<Json> {
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    return e as Error;
  }
}
