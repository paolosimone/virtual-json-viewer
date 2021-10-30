import { useEffect, useState } from "react";
import newJQ from "vendor/jq.wasm";
import { JQCommand } from "viewer/commons/state";

export function useJQ(
  jqWasmFile: string,
  jsonText: string,
  { filter }: JQCommand
): Result<string> {
  const [result, setResult] = useState<Result<string>>(jsonText);

  useEffect(() => {
    if (!filter || filter === ".") {
      setResult(jsonText);
      return;
    }

    // acquire lock to prevent race conditions
    let lock = true;

    async function applyFilterAsync() {
      try {
        const module = { locateFile: () => jqWasmFile, noExitRuntime: false };
        const jq = await newJQ(module);
        const result = await jq.invoke(jsonText, filter);
        if (lock) setResult(result);
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
