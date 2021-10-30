import { Icon, IconButton } from "viewer/components";
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
  return (
    <span className="w-5 mr-0.5">
      {!isLeaf && (
        <IconButton
          icon={isOpen ? Icon.ChevronDown : Icon.ChevronRight}
          onClick={() => setOpen(!isOpen)}
          className="w-4 h-4 align-middle"
        />
      )}
    </span>
  );
}
