/** Some sites render the same card twice in the DOM (e.g. separate
 *  mobile/desktop layout variants both present, controlled by CSS media
 *  queries rather than being removed from the markup) — cheerio sees both.
 *  Dedupe by id so downstream list rendering (which needs unique keys)
 *  never sees the same series/chapter twice. */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}
