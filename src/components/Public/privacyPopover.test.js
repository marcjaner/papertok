import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

/**
 * A visitor without an account is measured until they object, and Settings,
 * the only other place to object, needs an account. These hold the wiring
 * that gives them the switch and the policy: source tests, like the rest of
 * the guest chrome, because the bars are not something a harness mounts here.
 */

const read = async path => (await readFile(new URL(path, import.meta.url), 'utf8'))
  .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

test('a visitor reaches the analytics switch and the policy from both guest bars', async () => {
  const feed = await read('./GuestFeedPage.jsx');
  const header = feed.slice(feed.indexOf('<header className="guest-feed-header"'), feed.indexOf('</header>'));
  assert.match(header, /<ThemeToggle className="guest-header-button" \/>\s*<PrivacyPopover className="guest-header-button" \/>/);

  // From the first screen of the welcome on, and only for a visitor: account
  // onboarding shares the shell and has Settings.
  const welcome = await read('./GuestWelcome.jsx');
  const barAction = welcome.slice(welcome.indexOf('barAction={('), welcome.indexOf(')}', welcome.indexOf('barAction={(')));
  assert.match(barAction, /<PrivacyPopover className="gw-bar-button" \/>/);
  assert.doesNotMatch(await read('./WelcomeShell.jsx'), /PrivacyPopover/);
});

test('the switch reads and writes the one stored choice through the analytics context', async () => {
  const popover = await read('./PrivacyPopover.jsx');
  assert.match(popover, /const \{ consent, updateConsent \} = useAnalyticsConsent\(\);/);
  assert.match(popover, /checked=\{consent === ANALYTICS_CONSENT\.GRANTED\}/);
  assert.match(popover, /updateConsent\(checked \? ANALYTICS_CONSENT\.GRANTED : ANALYTICS_CONSENT\.DENIED\)/);
  // A second way to store the choice would be a second owner of it.
  assert.doesNotMatch(popover, /setAnalyticsConsent|persistAnalyticsConsent|localStorage|document\.cookie|papertok_analytics/);
});

test('a choice the browser refused to store is said, not just left unswitched', async () => {
  const popover = await read('./PrivacyPopover.jsx');
  assert.match(popover, /setSaveFailed\(!saved\)/);
  assert.match(popover, /<p role="status"[^>]*>\s*\{saveFailed \? COPY\.saveFailed : COPY\.kept\}/);
});
