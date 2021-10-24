import { useEffect, useState } from "react";
import newJQ from "vendor/jq.wasm";

export function useJQFilter(
  jqWasmFile: string,
  jsonText: string,
  filter: string
): string {
  const [result, setResult] = useState(jsonText);

  useEffect(() => {
    if (!filter || filter === ".") {
      setResult(jsonText);
      return;
    }

    // TODO race conditions?
    // TODO error handling
    async function applyFilter() {
      // we have to create a new instance each time
      // https://github.com/paolosimone/jq-wasm/issues/2
      const module = { locateFile: () => jqWasmFile, noExitRuntime: false };
      const jq = await newJQ(module);
      const result = await jq.invoke(jsonText, filter);
      setResult(result);
    }

    applyFilter();
  }, [jqWasmFile, jsonText, filter, setResult]);

  return result;
}
