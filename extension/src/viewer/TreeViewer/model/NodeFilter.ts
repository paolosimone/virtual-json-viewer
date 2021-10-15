import { Search } from "viewer/commons/Controls";
import * as J from "viewer/commons/JsonUtils";
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

function buildSearchStrategy(search: Search): SearchStrategy {
  return new CaseInsensitiveSearchStrategy(search.text);
}

class CaseInsensitiveSearchStrategy implements SearchStrategy {
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

function buildKeepStrategy(_search: Search): KeepStrategy {
  return new AnyMatchKeepStrategy();
}

class AnyMatchKeepStrategy implements KeepStrategy {
  keep(match: SearchMatch): boolean {
    return match.inAncestor || match.inValue || match.inKey;
  }
}
