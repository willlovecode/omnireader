import type { CheerioAPI } from 'cheerio/slim';

// Astro (astro.build) server-renders each interactive "island" component's
// initial props as JSON directly into the HTML (<astro-island props="...">),
// so client JS never needs to re-fetch what SSR already computed — which
// means a plain fetch() sees the same data a browser would, no WebView
// needed. Confirmed live 2026-07-13 on asurascans.com (all data — series
// cards, details, chapters, page images — comes from these, not from DOM
// classes, which is more robust against CSS/markup redesigns anyway).
//
// Astro's serialization wraps every value as [typeTag, value] (0 = plain
// value/object, 1 = array); this unwraps that recursively into normal JS.

function unwrap(node: unknown): unknown {
  // A [tag, value] tuple (tag 0 = plain value/object, 1 = array) — unwrap to
  // the value and keep recursing, regardless of nesting depth.
  if (Array.isArray(node) && node.length === 2 && (node[0] === 0 || node[0] === 1)) {
    return unwrap(node[1]);
  }
  if (Array.isArray(node)) {
    return node.map(unwrap);
  }
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(node as Record<string, unknown>)) {
      out[key] = unwrap((node as Record<string, unknown>)[key]);
    }
    return out;
  }
  return node;
}

/** Finds the first <astro-island> whose component-url contains
 *  `componentUrlIncludes` and returns its deserialized props. */
export function getIslandProps<T>($: CheerioAPI, componentUrlIncludes: string): T | undefined {
  let result: T | undefined;
  $('astro-island').each((_, el) => {
    if (result !== undefined) return;
    const componentUrl = $(el).attr('component-url') ?? '';
    if (!componentUrl.includes(componentUrlIncludes)) return;
    const raw = $(el).attr('props');
    if (!raw) return;
    result = unwrap(JSON.parse(raw)) as T;
  });
  return result;
}
