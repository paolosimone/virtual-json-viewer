import { useMemo, useState } from "react";
import "tailwindcss/tailwind.css";
import { EmptySearch } from "./commons/Search";
import { Toolbar } from "./Toolbar";
import { TreeViewer } from "./TreeViewer";

export type AppProps = {
  jsonText: string;
  jqWasmFile: string;
};

export function App({ jsonText }: AppProps): JSX.Element {
  const json = useMemo(() => JSON.parse(jsonText), [jsonText]);
  const [search, setSearch] = useState(EmptySearch);

  const searchBox = useMemo(
    () => ({ search: search, setSearch: setSearch }),
    [search, setSearch]
  );
  const toolbarProps = { searchBox: searchBox };

  return (
    <div className="flex flex-col h-full font-mono">
      <Toolbar {...toolbarProps} />
      <div className="flex-1 mt-1.5 pl-1.5">
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
