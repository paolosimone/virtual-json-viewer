import { JSX } from "react";
import {
  HighlightedText,
  HighlightedTextHandler,
  SEARCH_TYPE,
  SearchMatch,
} from "./HighlightedText";
import { LINK_TYPE, LinkifiedText, LinkMatch } from "./LinkifiedText";
import { SearchMatchHandler } from "./Renderer";

export type AnyMatch = SearchMatch | LinkMatch;

export type RenderedNode = string | JSX.Element;

export class NodeBuilder {
  private searchMatches: SearchMatchHandler[];
  private buildSearchNode: SearchNodeBuilder;
  private buildLinkNode: LinkNodeBuilder;

  constructor() {
    [this.searchMatches, this.buildSearchNode] = searchNodeBuilder();
    this.buildLinkNode = buildLinkNode;
  }

  public fromMatch(match: AnyMatch, children: RenderedNode[]): RenderedNode {
    switch (match.type) {
      case SEARCH_TYPE:
        return this.buildSearchNode(match, children);

      case LINK_TYPE:
        return this.buildLinkNode(match, children);
    }
  }

  public getSearchMatches(): SearchMatchHandler[] {
    return this.searchMatches;
  }
}

type SearchNodeBuilder = (
  match: SearchMatch,
  children: RenderedNode[],
) => RenderedNode;

class CollapsedSearchMatchHandler implements SearchMatchHandler {
  private nodeHandlers: HighlightedTextHandler[] = [];

  public add(handler: HighlightedTextHandler): void {
    this.nodeHandlers.push(handler);
  }

  public setSelected(selected: boolean): void {
    // mark all nodes as selected
    this.nodeHandlers.forEach((handler) => handler.setSelected(selected));
  }

  public scrollIntoView(): void {
    // scroll into view the first node
    this.nodeHandlers[0]?.scrollIntoView();
  }
}

function searchNodeBuilder(): [SearchMatchHandler[], SearchNodeBuilder] {
  // References array to keep search matches node handlers.
  // They start as placeholders and are resolved on rendering.
  const searchMatches: CollapsedSearchMatchHandler[] = [];

  // A search match can be split in multiple nodes,
  // this keeps track of the last match id to expose a single handler
  // for all consecuting nodes of the same match.
  let lastMatchId: Nullable<string> = null;

  function newSearchMatchRefCallback(id: string) {
    const isNewNode = lastMatchId !== id;
    if (isNewNode) {
      searchMatches.push(new CollapsedSearchMatchHandler());
      lastMatchId = id;
    }

    const index = searchMatches.length - 1;

    return (handler: HighlightedTextHandler) => {
      searchMatches[index].add(handler);
    };
  }

  function buildSearchNode(
    match: SearchMatch,
    children: RenderedNode[],
  ): RenderedNode {
    return (
      <HighlightedText key={match.id} ref={newSearchMatchRefCallback(match.id)}>
        {children}
      </HighlightedText>
    );
  }

  return [searchMatches, buildSearchNode];
}

type LinkNodeBuilder = (
  match: LinkMatch,
  children: RenderedNode[],
) => RenderedNode;

function buildLinkNode(
  match: LinkMatch,
  children: RenderedNode[],
): RenderedNode {
  return (
    <LinkifiedText key={match.id} {...match.metadata}>
      {children}
    </LinkifiedText>
  );
}
