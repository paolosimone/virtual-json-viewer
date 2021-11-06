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

  public match({ key, value, parent }: JsonNode): Nullable<SearchMatch> {
    const isArrayElement = parent !== null && Json.isArray(parent.value);
    const matchKey = !isArrayElement && this.searchStrategy.isMatch(key);

    const matchValue =
      value !== null && this.searchStrategy.isMatch(Json.toString(value));

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
