import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes';

import { useWebViewQueue } from './webViewQueue';

interface ProbeResult {
  html?: string;
  isChallenge?: boolean;
  selectorFound?: boolean;
  error?: string;
}

const POLL_INTERVAL_MS = 800;
// A silent Cloudflare-style JS challenge usually clears in a couple of
// seconds on its own; if it's still showing after this long, assume it
// needs an interactive human tap and surface the WebView.
const CHALLENGE_GRACE_MS = 6000;

function buildProbeScript(waitForSelector?: string): string {
  const selectorCheck = waitForSelector
    ? `!!document.querySelector(${JSON.stringify(waitForSelector)})`
    : 'true';
  return `
    (function () {
      try {
        var title = document.title || '';
        var isChallenge = /just a moment|attention required|checking your browser/i.test(title)
          || !!document.querySelector('#challenge-running, .cf-turnstile, #cf-please-wait, #challenge-form');
        var result = {
          html: document.documentElement.outerHTML,
          isChallenge: isChallenge,
          selectorFound: ${selectorCheck},
        };
        window.ReactNativeWebView.postMessage(JSON.stringify(result));
      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ error: String(e) }));
      }
    })();
    true;
  `;
}

/** Mounted once near the app root. Renders whatever URL is at the front of
 *  the webViewQueue in a normally-invisible (0×0) WebView, polls it until
 *  the requested content is ready, and resolves the caller's promise with
 *  the final HTML. If it detects a stuck interactive challenge (not just a
 *  brief silent one), it becomes a visible on-screen overlay so the user
 *  can complete it — the WebView instance itself never remounts across that
 *  transition, only its container's size/visibility changes, so an
 *  in-progress challenge isn't lost. */
export function WebViewRenderHost() {
  const currentJob = useWebViewQueue((s) => s.currentJob);
  const needsManualVerification = useWebViewQueue((s) => s.needsManualVerification);
  const setNeedsManualVerification = useWebViewQueue((s) => s.setNeedsManualVerification);
  const finishCurrent = useWebViewQueue((s) => s.finishCurrent);

  const webViewRef = useRef<WebView>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const challengeSinceRef = useRef<number | null>(null);

  useEffect(() => {
    challengeSinceRef.current = null;
    if (pollRef.current) clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!currentJob) return;

    timeoutRef.current = setTimeout(() => {
      currentJob.reject(new Error(`Timed out rendering ${currentJob.url}`));
      finishCurrent();
    }, currentJob.timeoutMs);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentJob?.id]);

  if (!currentJob) return null;

  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      webViewRef.current?.injectJavaScript(buildProbeScript(currentJob.waitForSelector));
    }, POLL_INTERVAL_MS);
  };

  const onMessage = (event: WebViewMessageEvent) => {
    let data: ProbeResult;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (data.error) return;

    if (data.isChallenge) {
      if (challengeSinceRef.current == null) challengeSinceRef.current = Date.now();
      if (Date.now() - challengeSinceRef.current > CHALLENGE_GRACE_MS && !needsManualVerification) {
        setNeedsManualVerification(true);
      }
      return;
    }

    if (data.selectorFound && data.html) {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      currentJob.resolve(data.html);
      finishCurrent();
    }
  };

  const cancel = () => {
    currentJob.reject(new Error('Verification cancelled'));
    finishCurrent();
  };

  let hostname = currentJob.url;
  try {
    hostname = new URL(currentJob.url).hostname;
  } catch {
    // keep the raw url as a fallback label
  }

  return (
    <View
      style={needsManualVerification ? styles.visibleOverlay : styles.hidden}
      pointerEvents={needsManualVerification ? 'auto' : 'none'}
    >
      {needsManualVerification && (
        <View style={styles.card}>
          <Text style={styles.title}>Verify you're human</Text>
          <Text style={styles.subtitle}>{hostname}</Text>
          <View style={styles.webviewFrame}>
            <WebView
              ref={webViewRef}
              source={{ uri: currentJob.url }}
              onLoadEnd={startPolling}
              onMessage={onMessage}
              style={styles.webview}
            />
          </View>
          <Pressable style={styles.cancelButton} onPress={cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      )}
      {!needsManualVerification && (
        <WebView
          ref={webViewRef}
          source={{ uri: currentJob.url }}
          onLoadEnd={startPolling}
          onMessage={onMessage}
          style={styles.webview}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: { position: 'absolute', top: 0, left: 0, width: 1, height: 1, opacity: 0 },
  visibleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: { width: '100%', maxWidth: 420, height: '70%', backgroundColor: '#1c1c1e', borderRadius: 16, padding: 16 },
  title: { color: '#fff', fontSize: 17, fontWeight: '700' },
  subtitle: { color: '#98989d', fontSize: 13, marginBottom: 12 },
  webviewFrame: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  webview: { flex: 1 },
  cancelButton: { alignSelf: 'center', marginTop: 12, paddingVertical: 8, paddingHorizontal: 16 },
  cancelText: { color: '#0A84FF', fontSize: 15, fontWeight: '600' },
});
