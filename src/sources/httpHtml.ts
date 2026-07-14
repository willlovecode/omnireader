import * as cheerio from 'cheerio/slim';

import type { RequestContext } from './Source';

// Shared by every hand-written source — same fetch-and-parse shape each
// time (spoof a mobile Safari UA, send Referer, load with cheerio).
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

export async function fetchHtml(
  url: string,
  baseUrl: string,
  ctx?: RequestContext,
): Promise<cheerio.CheerioAPI> {
  const res = await fetch(url, {
    headers: { 'User-Agent': DEFAULT_USER_AGENT, Referer: baseUrl, ...ctx?.headers },
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${url}`);
  }
  return cheerio.load(await res.text());
}
