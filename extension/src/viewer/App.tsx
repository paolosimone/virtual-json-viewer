import { useMemo, useState } from "react";
import "tailwindcss/tailwind.css";
import { EmptySearch } from "./commons/Controls";
import { Toolbar } from "./Toolbar";
import { TreeViewer } from "./TreeViewer";

export type AppProps = {
  jsonText: string;
  jqWasmFile: string;
};

export function App({ jsonText }: AppProps): JSX.Element {
  const json = useMemo(() => JSON.parse(jsonText), [jsonText]);
  const [search, setSearch] = useState(EmptySearch);

  return (
    <div className="flex flex-col h-full pl-4 pt-4 font-mono">
      <Toolbar setSearch={setSearch} />
      <div className="flex-1">
        <TreeViewer json={json} search={search} />
      </div>
    </div>
  );
}

// Coming soon...
//
// import newJQ from "vendor/jq-web.wasm";
//
// const [jq, setJQ] = useState(null);
// useEffect(() => {
//   newJQ({ locateFile: () => props.wasmFile }).then((module: any) =>
//     setJQ(module)
//   );
// }, [props.wasmFile]);

// const [json, setJson] = useState(null);
// useEffect(() => {
//   if (jq == null) {
//     return;
//   }

//   setJson(null);
//   (jq as any).invoke(props.jsonText, query).then((jsonText: string) => {
//     const json = JSON.parse(jsonText);
//     setJson(json);
//   });
// }, [jq, props.jsonText, query]);
