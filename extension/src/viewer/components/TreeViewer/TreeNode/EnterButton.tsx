import { dispatch, EnterNodeEvent, NodePath } from "@/viewer/commons/EventBus";
import { Icon, IconButton } from "@/viewer/components";
import classNames from "classnames";
import { JSX, Ref, useImperativeHandle, useMemo } from "react";
import { NodeState } from "../Tree";

export type EnterButtonHandle = {
  enter(): void;
};

export type EnterButtonProps = Props<{
  node: NodeState;
  enabled: boolean;
  ref?: Ref<EnterButtonHandle>;
}>;

export function EnterButton({
  node,
  enabled,
  className,
  ref,
}: EnterButtonProps): JSX.Element {
  const path = useMemo(() => buildPath(node), [node]);
  enabled = enabled && path.length > 0;

  useImperativeHandle(
    ref,
    () => ({
      enter() {
        if (enabled) {
          enterNode(path);
        }
      },
    }),
    [enabled, path],
  );

  return (
    <span className={classNames("mr-1 w-5 min-w-5", className)}>
      {enabled && (
        <IconButton
          icon={Icon.ArrowRight}
          onClick={() => enterNode(path)}
          className="fill-viewer-foreground h-5 w-5 align-middle"
          tabIndex={-1}
        />
      )}
    </span>
  );
}

function buildPath(node: NodeState): NodePath {
  if (node.key === null) return [];
  const path = [node.key];
  while (node.parent) {
    node = node.parent;
    path.push(node.key!);
  }
  return path.reverse();
}

function enterNode(path: NodePath) {
  dispatch(new EnterNodeEvent(path));
}
