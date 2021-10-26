import classNames from "classnames";
import { useEffect, useRef } from "react";
import { VariableSizeNodePublicState as NodeState } from "react-vtree";
import { NodeComponentProps } from "react-vtree/dist/es/Tree";
import { JsonNodeData } from "../model/JsonNode";
import { Key } from "./Key";
import { OpenButton } from "./OpenButton";
import { Value } from "./Value";

export type JsonTreeNode = NodeComponentProps<
  JsonNodeData,
  NodeState<JsonNodeData>
>;

export function TreeNode({
  data,
  style,
  resize,
  isOpen,
  setOpen,
}: JsonTreeNode): JSX.Element {
  const [parent, content] = useFitContent(resize);

  const fadeContent = { "opacity-60": !isMatched(data) };

  return (
    <div ref={parent} style={{ ...style, paddingLeft: `${data.nesting}em` }}>
      <div
        ref={content}
        className={classNames("flex items-start", fadeContent)}
      >
        <OpenButton data={data} isOpen={isOpen} setOpen={setOpen} />
        <Key data={data} />
        <Value data={data} isOpen={isOpen} />
      </div>
    </div>
  );
}

type Resize = (height: number, shouldForceUpdate?: boolean) => void;
type Ref = React.RefObject<HTMLDivElement>;
type ParentContentRefs = [Ref, Ref];

function useFitContent(resize: Resize): ParentContentRefs {
  const PADDING_HEIGHT = 2;
  const TOLERANCE = 2;

  const parent = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  const fitContent = () => {
    const parentHeight = parent.current?.clientHeight ?? 0;
    const contentHeight = (content.current?.clientHeight ?? 0) + PADDING_HEIGHT;
    const delta = Math.abs(contentHeight - parentHeight);
    if (delta > TOLERANCE) {
      resize(contentHeight, true);
    }
  };

  useEffect(fitContent);

  return [parent, content];
}

function isMatched({ searchMatch, isLeaf }: JsonNodeData) {
  if (!searchMatch) {
    return true;
  }

  return searchMatch.inKey || (isLeaf && searchMatch.inValue);
}
