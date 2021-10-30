import * as J from "viewer/commons/JsonUtils";
import { Search } from "viewer/commons/Search";
import { JsonNode, SearchMatch } from "./JsonNode";

export class NodeFilter {
  searchStrategy: SearchStrategy;
  keepStrategy: KeepStrategy;

  public static fromSearch(search: Search): NodeFilter {
    if (!search.text) {
      throw new Error("Search query is empty");
    }

    return new NodeFilter(
      buildSearchStrategy(search),
      buildKeepStrategy(search)
    );
  }

  constructor(searchStrategy: SearchStrategy, keepStrategy: KeepStrategy) {
    this.searchStrategy = searchStrategy;
    this.keepStrategy = keepStrategy;
  }

  public match({ key, value, parent }: JsonNode): Nullable<SearchMatch> {
    const isArrayElement = parent !== null && J.isArray(parent.value);
    const matchKey = !isArrayElement && this.searchStrategy.isMatch(key);

    const matchValue =
      value !== null && this.searchStrategy.isMatch(JSON.stringify(value));

    const matchAncestor =
      parent?.searchMatch?.inKey || parent?.searchMatch?.inAncestor || false;

    const searchMatch = {
      inKey: matchKey,
      inValue: matchValue,
      inAncestor: matchAncestor,
    };

    return this.keepStrategy.keep(searchMatch) ? searchMatch : null;
  }
}

interface SearchStrategy {
  isMatch(text: string): boolean;
}

function buildSearchStrategy({ text }: Search): SearchStrategy {
  return new CaseInsensitiveSearch(text);
}

class CaseInsensitiveSearch implements SearchStrategy {
  searchText: string;

  constructor(searchText: string) {
    this.searchText = searchText.toLowerCase();
  }

  isMatch(text: string): boolean {
    return text.toLowerCase().includes(this.searchText);
  }
}

interface KeepStrategy {
  keep(match: SearchMatch): boolean;
}

function buildKeepStrategy({ showMismatch }: Search): KeepStrategy {
  return showMismatch ? new KeepFullPaths() : new KeepPathsUntilMatch();
}

class KeepFullPaths implements KeepStrategy {
  keep(match: SearchMatch): boolean {
    return match.inAncestor || match.inKey || match.inValue;
  }
}

class KeepPathsUntilMatch implements KeepStrategy {
  keep(match: SearchMatch): boolean {
    return match.inKey || match.inValue;
  }
}
