import { useEffect, useMemo, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const mediaQuery = useMemo(() => window.matchMedia(query), [query]);
  const [match, setMatch] = useState(mediaQuery.matches);

  useEffect(() => {
    mediaQuery.onchange = (e: MediaQueryListEvent) => setMatch(e.matches);
  }, [mediaQuery, setMatch]);

  return match;
}
