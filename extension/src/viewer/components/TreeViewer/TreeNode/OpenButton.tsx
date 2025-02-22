import { Icon, IconButton } from "@/viewer/components";
import classNames from "classnames";
import { JSX } from "react";
import { TreeNavigator } from "../TreeNavigator";
import { JsonNodeData } from "../model/JsonNode";

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
    <span className={classNames("mr-0.5 w-5 min-w-5", className)}>
      {treeNavigator.canOpen(id) && (
        <IconButton
          icon={treeNavigator.isOpen(id) ? Icon.ChevronDown : Icon.ChevronRight}
          onClick={() => treeNavigator.toogleOpen(id)}
          className="fill-viewer-foreground h-4 w-4 align-middle"
          tabIndex={-1}
        />
      )}
    </span>
  );
}
