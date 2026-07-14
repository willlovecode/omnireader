import { useWebViewQueue } from './webViewQueue';

export interface RenderInWebViewOptions {
  /** Wait until this selector exists before resolving — for pages whose
   *  content streams in after load. Omit for pages that are done as soon
   *  as the network settles. */
  waitForSelector?: string;
  timeoutMs?: number;
}

/** Renders `url` in the shared hidden WebView (mounted once via
 *  <WebViewRenderHost/> near the app root) and resolves with the final
 *  rendered HTML — same contract as a plain fetch(), for sites that need
 *  real JS execution (or a Cloudflare-style challenge solved) before their
 *  content exists. See CLAUDE.md: "add an optional render-in-hidden-WebView
 *  flag" for genuinely non-declarative sources. */
export function renderInWebView(url: string, opts?: RenderInWebViewOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    useWebViewQueue.getState().enqueue({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url,
      waitForSelector: opts?.waitForSelector,
      timeoutMs: opts?.timeoutMs ?? 25_000,
      resolve,
      reject,
    });
  });
}
