import classNames from "classnames";
import { JSX } from "react";
// import { TreeNavigator } from "../TreeNavigator";
import { JsonNode } from "../loader/JsonNode";

export type OpenProps = Props<{
  node: JsonNode;
  // treeNavigator: TreeNavigator;
}>;

export function OpenButton({
  node: { id },
  // treeNavigator,
  className,
}: OpenProps): JSX.Element {
  return (
    <span className={classNames("mr-0.5 w-5 min-w-5", className)}>
      {/* {treeNavigator.canOpen(id) && (
        <IconButton
          icon={treeNavigator.isOpen(id) ? Icon.ChevronDown : Icon.ChevronRight}
          onClick={() => treeNavigator.toogleOpen(id)}
          className="fill-viewer-foreground h-4 w-4 align-middle"
          tabIndex={-1}
        />
      )} */}
    </span>
  );
}
