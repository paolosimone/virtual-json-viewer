import { SEARCH_TYPE } from "./HighlightedText";
import { LINK_TYPE } from "./LinkifiedText";
import { MatchesResult } from "./Matcher";
import { AnyMatch, NodeBuilder, RenderedNode } from "./RenderedNode";

export type RenderedMatchesResult = {
  nodes: RenderedNode[];
  searchMatches: SearchMatchHandler[];
};

export interface SearchMatchHandler {
  setSelected: (selected: boolean) => void;
  scrollIntoView: () => void;
}

export function renderMatches(
  text: string,
  matches: MatchesResult,
): RenderedMatchesResult {
  const allMatches = [...matches.searchMatches, ...matches.linkMatches];

  if (!allMatches.length) {
    return { nodes: [text], searchMatches: [] };
  }

  // split matches in starting/ending edges
  const edges: Edge[] = allMatches.flatMap((match) => [
    { id: match.id, index: match.start, direction: START, match: match },
    { id: match.id, index: match.end, direction: END, match: match },
  ]);

  // sort to process them in order
  edges.sort(compareEdges);

  // since matches from different sources can overlap
  // they must be rebalanced, e.g.
  // a[b(c]d)e => a[b(c)](d)e

  // stack of open tags
  const started: AnyMatch[] = [];

  // stack of children for each open tag
  const nodesStack: RenderedNode[][] = [[]];

  // register nodes as they are created
  const nodeBuilder = new NodeBuilder();

  let lastIndex = 0;
  for (const { index, direction, match } of edges) {
    // current level nodes
    let nodes = nodesStack[nodesStack.length - 1];

    // add elapsed text to current level
    if (index > lastIndex) {
      nodes.push(text.substring(lastIndex, index));
      lastIndex = index;
    }

    // if it's a starting edge: simply add a new level to the stack
    if (direction === START) {
      started.push(match);
      nodesStack.push([]);
      continue;
    }

    // it's a ending edge

    // remove level from the stack
    let ended = started.pop()!;
    let endedNodes = nodesStack.pop()!;
    nodes = nodesStack[nodesStack.length - 1];

    // end all unrelated matches, we will restart them soon
    const toRestarts: AnyMatch[] = [];
    while (ended.id !== match.id) {
      // end unrelated match
      if (endedNodes.length) {
        nodes.push(nodeBuilder.fromMatch(ended, endedNodes));
      }

      // mark it to be restarted
      toRestarts.push(ended);

      // remove also this level
      ended = started.pop()!;
      endedNodes = nodesStack.pop()!;
      nodes = nodesStack[nodesStack.length - 1];
    }

    // end current match
    if (endedNodes.length) {
      nodes.push(nodeBuilder.fromMatch(ended, endedNodes));
    }

    // restart unrelated edges
    while (toRestarts.length) {
      started.push(toRestarts.pop()!);
      nodesStack.push([]);
    }
  }

  // push remaining text
  if (text.length > lastIndex) {
    nodesStack[0].push(text.substring(lastIndex));
  }

  return {
    nodes: nodesStack[0],
    searchMatches: nodeBuilder.getSearchMatches(),
  };
}

// numerical value is used for comparison
const START = 0;
const END = 1;

type Edge = {
  id: string;
  index: number;
  direction: typeof START | typeof END;
  match: AnyMatch;
};

// lower priority types are used as outermost tags
// e.g. links should wrap mark tags
const TYPE_PRIORITY = {
  [LINK_TYPE]: 0,
  [SEARCH_TYPE]: 1,
};

function compareEdges(a: Edge, b: Edge): number {
  // ascending by index
  if (a.index !== b.index) {
    return a.index - b.index;
  }

  // end before start: close all opened tags before opening a new one
  if (a.direction !== b.direction) {
    return b.direction - a.direction;
  }

  // close tags in the opposite order they have been opened
  const order = a.direction === START ? 1 : -1;

  // outermost to inmost
  if (a.match.type !== b.match.type) {
    return order * (TYPE_PRIORITY[a.match.type] - TYPE_PRIORITY[b.match.type]);
  }

  // arbitrary but stable order based on id
  return order * a.id.localeCompare(b.id);
}
