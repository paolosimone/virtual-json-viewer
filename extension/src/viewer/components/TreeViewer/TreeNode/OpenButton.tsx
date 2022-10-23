import classNames from "classnames";
import { Icon, IconButton } from "viewer/components";
import { JsonNodeData } from "../model/JsonNode";
import { TreeNavigator } from "../TreeNavigator";

export type OpenProps = Props<{
  data: JsonNodeData;
  treeNavigator: TreeNavigator;
}>;

export function OpenButton({
  data: { id },
  treeNavigator,
  className,
}: OpenProps): JSX.Element {
  return (
    <span className={classNames("w-5 min-w-5 mr-0.5", className)}>
      {treeNavigator.canOpen(id) && (
        <IconButton
          icon={treeNavigator.isOpen(id) ? Icon.ChevronDown : Icon.ChevronRight}
          onClick={() => treeNavigator.toogleOpen(id)}
          className="w-4 h-4 align-middle fill-viewer-foreground"
          tabIndex={-1}
        />
      )}
    </span>
  );
}
