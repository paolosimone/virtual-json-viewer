import { Icon, IconButton } from "@/viewer/components";
import classNames from "classnames";
import { JSX } from "react";
import { NodeState } from "../Tree";
// import { TreeNavigator } from "../TreeNavigator";

export type OpenProps = Props<{
  node: NodeState;
  // treeNavigator: TreeNavigator;
}>;

export function OpenButton({
  node: { id, isLeaf, isOpen },
  // treeNavigator,
  className,
}: OpenProps): JSX.Element {
  return (
    <span className={classNames("mr-0.5 w-5 min-w-5", className)}>
      {!isLeaf && (
        <IconButton
          icon={isOpen ? Icon.ChevronDown : Icon.ChevronRight}
          // onClick={() => treeNavigator.toogleOpen(id)}
          className="fill-viewer-foreground h-4 w-4 align-middle"
          tabIndex={-1}
        />
      )}
    </span>
  );
}
