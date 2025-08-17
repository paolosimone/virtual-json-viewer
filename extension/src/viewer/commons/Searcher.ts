export type SearchMatchRange = {
  start: number;
  end: number;
};

export interface Searcher {
  findMatches(text: string): SearchMatchRange[];
}

export function buildSearcher(
  searchText: string,
  caseSensitive?: boolean,
): Searcher {
  return caseSensitive
    ? new CaseSensitiveSearcher(searchText)
    : new CaseInsensitiveSearcher(searchText);
}

class CaseInsensitiveSearcher implements Searcher {
  private search: Searcher;

  constructor(searchText: string) {
    this.search = new CaseSensitiveSearcher(searchText.toLowerCase());
  }

  public findMatches(text: string): SearchMatchRange[] {
    return this.search.findMatches(text.toLowerCase());
  }
}

class CaseSensitiveSearcher implements Searcher {
  private searchText: string;

  constructor(searchText: string) {
    this.searchText = searchText;
  }

  public findMatches(text: string): SearchMatchRange[] {
    const matches: SearchMatchRange[] = [];

    let start = text.indexOf(this.searchText);
    while (start !== -1) {
      const end = start + this.searchText.length;
      matches.push({ start, end });
      start = text.indexOf(this.searchText, end);
    }

    return matches;
  }
}
