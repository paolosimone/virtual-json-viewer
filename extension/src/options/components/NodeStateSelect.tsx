import { GlobalOptionsContext } from "@/options/Context";
import { Dispatch, JSX, useContext } from "react";
import { Select } from "@/viewer/components";

export type NodeStateSelectProps = Props<{
  expandNodes: boolean;
  setExpandNodes: Dispatch<boolean>;
}>;

export function NodeStateSelect({
  expandNodes,
  setExpandNodes,
  className,
}: NodeStateSelectProps): JSX.Element {
  const { t } = useContext(GlobalOptionsContext);

  const options = [
    {
      value: NodeState.Collapsed,
      label: t.settings.nodeState.collapsed,
    },
    {
      value: NodeState.Expanded,
      label: t.settings.nodeState.expanded,
    },
  ];

  return (
    <Select
      options={options}
      selected={expandNodes ? NodeState.Expanded : NodeState.Collapsed}
      setValue={(newNodeState: NodeState) =>
        setExpandNodes(newNodeState === NodeState.Expanded)
      }
      className={className}
    />
  );
}

enum NodeState {
  Collapsed = "collapsed",
  Expanded = "expanded",
}
