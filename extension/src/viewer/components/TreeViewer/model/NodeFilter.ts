import * as J from "viewer/commons/JsonUtils";
import { Search } from "viewer/commons/state";
import { JsonNode, SearchMatch } from "./JsonNode";

export class NodeFilter {
  search: Search;
  searchStrategy: SearchStrategy;
  keepStrategy: KeepStrategy;

  constructor(search: Search) {
    if (!search.text) {
      throw new Error("Search query is empty");
    }

    this.search = search;
    this.searchStrategy = buildSearchStrategy(search);
    this.keepStrategy = buildKeepStrategy(search);
  }

  public match({ key, value, parent }: JsonNode): Nullable<SearchMatch> {
    const isArrayElement = parent !== null && J.isArray(parent.value);
    const matchKey = !isArrayElement && this.searchStrategy.isMatch(key);

    const matchValue =
      value !== null && this.searchStrategy.isMatch(JSON.stringify(value));

    const matchAncestor =
      parent?.searchMatch?.inKey || parent?.searchMatch?.inAncestor || false;

    const searchMatch = {
      search: this.search,
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
