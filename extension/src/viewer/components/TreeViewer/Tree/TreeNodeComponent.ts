import { NodeState } from "./NodeState";

export type TreeNodeProps<Context> = {
  style?: React.CSSProperties;
  node: NodeState;
  context: Context;
};

export type TreeNodeComponent<Context> = React.ComponentType<
  TreeNodeProps<Context>
>;
