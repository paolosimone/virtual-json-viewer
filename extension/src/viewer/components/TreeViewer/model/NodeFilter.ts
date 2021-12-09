import * as Json from "viewer/commons/Json";
import { Search } from "viewer/state";
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

  public match(node: JsonNode): Nullable<SearchMatch> {
    const searchMatch = {
      search: this.search,
      inKey: this.matchKey(node),
      inValue: this.matchValue(node),
      inAncestor: this.matchAncestor(node),
    };

    return this.keepStrategy.keep(searchMatch) ? searchMatch : null;
  }

  private matchKey({ key, parent }: JsonNode): boolean {
    if (key === null) {
      return false;
    }

    if (parent && !parent.searchMatch?.inValue) {
      return false;
    }

    const isArrayElement = typeof key === "number";
    return !isArrayElement && this.searchStrategy.isMatch(key);
  }

  private matchValue({ value, parent }: JsonNode): boolean {
    if (value === null) {
      return false;
    }

    if (parent && !parent.searchMatch?.inValue) {
      return false;
    }

    return this.searchStrategy.isMatch(Json.toString(value));
  }

  private matchAncestor({ parent }: JsonNode): boolean {
    return (
      parent?.searchMatch?.inAncestor || parent?.searchMatch?.inKey || false
    );
  }
}

interface SearchStrategy {
  isMatch(text: string): boolean;
}

function buildSearchStrategy({ caseSensitive, text }: Search): SearchStrategy {
  return caseSensitive
    ? new CaseSensitiveSearch(text)
    : new CaseInsensitiveSearch(text);
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

class CaseSensitiveSearch implements SearchStrategy {
  searchText: string;

  constructor(searchText: string) {
    this.searchText = searchText;
  }

  isMatch(text: string): boolean {
    return text.includes(this.searchText);
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
