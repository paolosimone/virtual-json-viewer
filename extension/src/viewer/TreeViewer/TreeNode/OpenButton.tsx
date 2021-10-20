import { JsonNodeData } from "../model/JsonNode";

export type OpenProps = {
  data: JsonNodeData;
  isOpen: boolean;
  setOpen: (state: boolean) => Promise<void>;
};

export function OpenButton({
  data: { isLeaf },
  isOpen,
  setOpen,
}: OpenProps): JSX.Element {
  if (isLeaf) {
    return <span className="w-5 mr-0.5" />;
  }

  return (
    <button
      className="w-5 mr-0.5 text-gray-600"
      onClick={() => setOpen(!isOpen)}
    >
      {isOpen ? "⮟" : "⮞"}
    </button>
  );
}
