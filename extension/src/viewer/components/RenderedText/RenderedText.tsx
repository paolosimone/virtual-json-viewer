import { Search } from "@/viewer/state";
import { ReactNode } from "react";
import { uid } from "uid";
import {
  HighlightedText,
  SEARCH_TYPE,
  SearchMatch,
  matchSearch,
} from "./HighlightedText";
import {
  LINK_TYPE,
  LinkMatch,
  LinkifiedText,
  matchLinks,
} from "./LinkifiedText";

export type RenderedTextProps = Props<{
  text: string;
  search: Nullable<Search>;
  linkifyUrls: boolean;
}>;

export function RenderedText({
  text,
  search,
  linkifyUrls,
}: RenderedTextProps): ReactNode {
  const searchMatches = search?.text
    ? matchSearch(text, {
        searchText: search.text,
        caseSensitive: search.caseSensitive,
      })
    : [];

  const linkMatches = linkifyUrls ? matchLinks(text) : [];

  return renderMatches(text, [...searchMatches, ...linkMatches]);
}

type AnyMatch = SearchMatch | LinkMatch;

// numerical value is used for comparison
const START = 0;
const END = 1;

type Edge = {
  id: string;
  index: number;
  direction: typeof START | typeof END;
  match: AnyMatch;
};

function renderMatches(text: string, matches: AnyMatch[]): ReactNode {
  if (!matches.length) {
    return text;
  }

  // split matches in starting/ending edges
  const edges: Edge[] = matches.flatMap((match) => [
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
  const nodesStack: ReactNode[][] = [[]];

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
        nodes.push(nodeFromMatch(ended, endedNodes));
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
      nodes.push(nodeFromMatch(ended, endedNodes));
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

  return nodesStack[0];
}

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

  // arbitrary order based on id
  return order * a.id.localeCompare(b.id);
}

function nodeFromMatch(match: AnyMatch, children: ReactNode[]): ReactNode {
  switch (match.type) {
    case SEARCH_TYPE:
      return <HighlightedText key={uid()}>{children}</HighlightedText>;

    case LINK_TYPE:
      return (
        <LinkifiedText key={uid()} {...match.metadata}>
          {children}
        </LinkifiedText>
      );
  }
}
