import classNames from "classnames";
import { useEffect, useRef } from "react";
import { VariableSizeNodePublicState as NodeState } from "react-vtree";
import { NodeComponentProps } from "react-vtree/dist/es/Tree";
import { Search } from "viewer/state";
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

  const searchAnalysis = analyzeSearchMatch(data);
  const fade = { "opacity-60": !searchAnalysis.inMatchingPath };

  return (
    <div ref={parent} style={{ ...style, paddingLeft: `${data.nesting}em` }}>
      <div ref={content} className={classNames("flex items-start", fade)}>
        <OpenButton data={data} isOpen={isOpen} setOpen={setOpen} />
        <Key data={data} search={searchAnalysis.keySearch} />
        <Value
          data={data}
          isOpen={isOpen}
          search={searchAnalysis.valueSearch}
        />
      </div>
    </div>
  );
}

type Resize = (height: number, shouldForceUpdate?: boolean) => void;
type Ref = React.RefObject<HTMLDivElement>;
type ParentContentRefs = [Ref, Ref];

function useFitContent(resize: Resize): ParentContentRefs {
  const PADDING_HEIGHT = 4;
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

  // fit content on every component update
  useEffect(fitContent);

  return [parent, content];
}

type SearchMatchAnalysis = {
  inMatchingPath: boolean;
  keySearch: Nullable<Search>;
  valueSearch: Nullable<Search>;
};

function analyzeSearchMatch({
  searchMatch,
  isLeaf,
}: JsonNodeData): SearchMatchAnalysis {
  if (!searchMatch) {
    return { inMatchingPath: true, keySearch: null, valueSearch: null };
  }

  return {
    inMatchingPath: searchMatch.inKey || searchMatch.inValue,
    keySearch: searchMatch.inKey ? searchMatch.search : null,
    valueSearch: isLeaf && searchMatch.inValue ? searchMatch.search : null,
  };
}
