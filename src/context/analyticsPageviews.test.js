import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const SOURCE = new URL('./AnalyticsContext.jsx', import.meta.url);
const APP_HTML = new URL('../../index.html', import.meta.url);

test('SOURCE: a page view is sent on every pathname change, and only while analytics is allowed', async () => {
  const source = await readFile(SOURCE, 'utf8');
  // Comments are prose, not code: a comment that happens to mention
  // `trackPageView` must never change what this test sees. Strip them first,
  // the same way analyticsService.test.js does, so only real code is scanned.
  const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

  // Two papers share the pattern `/public/paper/:id`. Keyed on the pattern,
  // the second one was never a page view; keyed on the pathname it is, and
  // what travels is still only the pattern (`trackPageView` normalizes it).
  // The effect must also read `location.pathname` itself, so a fixed string
  // cannot stand in for the page the reader is on.
  assert.match(
    code,
    /useEffect\(\(\) => \{\s*if \(consent !== ANALYTICS_CONSENT\.GRANTED\) return;\s*trackPageView\(location\.pathname\);\s*\}, \[consent, location\.pathname\]\);/,
    'the page view must wait for consent and be keyed on the pathname',
  );
  // One emitter: a second one would count every visit twice.
  assert.equal(code.match(/\btrackPageView\(/g)?.length, 1, 'page views are sent from more than one place');
});

/**
 * The other half of the same promise, and the half a sanitizer cannot keep.
 *
 * `sanitizeAnalyticsCapture` owns the analytics PAYLOAD. It owns nothing about
 * the request's headers, and the browser's default referrer policy
 * (`strict-origin-when-cross-origin`) puts the full URL in `Referer` on every
 * SAME-ORIGIN request — which is what every analytics request to `/ingest` is.
 * Measured in a browser with the previous transport (the probe lived in
 * scripts/diagnostics/ and went with the landing it also checked): reading a
 * paper made the app's own `<script src="/_vercel/insights/script.js">` carry
 * `Referer: <origin>/public/paper/<the real key>`.
 *
 * Under HashRouter this was safe for free — a fragment is stripped out of
 * `Referer` — so nothing in the app ever had to say so. Real paths
 * (src/main.jsx) ended that, and `/privacy.html` still promises "which one
 * never travels". `strict-origin` is the one line that keeps it, for the
 * analytics requests and for every other request the app makes.
 */
test('SOURCE: the app document never puts a path in a Referer header', async () => {
  const html = await readFile(APP_HTML, 'utf8');
  const meta = html.replace(/<!--[\s\S]*?-->/g, '').match(/<meta\s+name="referrer"[^>]*>/i);
  assert.ok(meta, 'the app document declares no referrer policy, so the browser default sends the full path');

  const policy = meta[0].match(/content="([^"]*)"/i)?.[1];
  // Only the policies that never reveal a path. `origin-when-cross-origin` and
  // `strict-origin-when-cross-origin` both send the full URL same-origin, which
  // is exactly the case that leaked, so neither is acceptable here.
  assert.ok(
    ['strict-origin', 'origin', 'no-referrer'].includes(policy),
    `referrer policy ${JSON.stringify(policy)} still sends the full path to our own origin`,
  );
});
