import * as cheerio from 'cheerio/slim';

import { renderInWebView, type RenderInWebViewOptions } from './renderInWebView';

/** Same contract as ../httpHtml.ts's fetchHtml, but goes through a real
 *  rendered WebView instead of a plain fetch(). */
export async function fetchHtmlViaWebView(
  url: string,
  opts?: RenderInWebViewOptions,
): Promise<cheerio.CheerioAPI> {
  const html = await renderInWebView(url, opts);
  return cheerio.load(html);
}
