import { useState } from 'react';
import { ArrowUpRight, ShieldCheck } from '@phosphor-icons/react';
import { useAnalyticsConsent } from '../../context/AnalyticsContext.jsx';
import { cn } from '../../lib/utils.js';
import { ANALYTICS_CONSENT } from '../../services/analyticsService.js';
import { buttonVariants } from '../ui/button-variants.js';
import { Label } from '../ui/label.jsx';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '../ui/popover.jsx';
import { Switch } from '../ui/switch.jsx';
import './PrivacyPopover.css';

const COPY = {
  name: 'Privacy',
  lede: 'PaperTok counts pages and actions anonymously, without cookies. Never your searches, the papers you read or your interests.',
  toggle: 'Allow usage analytics',
  kept: 'Your choice is kept in this browser.',
  saveFailed: 'Not saved: this browser is blocking site storage, so analytics is unchanged.',
  policy: 'Privacy policy',
  newTab: ' (opens in a new tab)',
};

/**
 * A visitor without an account is measured until they object, and has no
 * Settings to object in: this is their switch, and their way to the policy,
 * from the first screen of the welcome on. The host passes its own chrome
 * class, as it does for ThemeToggle. The choice belongs to analyticsService and
 * goes through the analytics context, exactly like the Settings switch, so the
 * two cannot disagree.
 */
export default function PrivacyPopover({ className = '' }) {
  const { consent, updateConsent } = useAnalyticsConsent();
  const [saveFailed, setSaveFailed] = useState(false);

  // `updateConsent` only moves the switch when the choice was stored, so a
  // browser that refuses storage leaves it where it was; say so in words.
  const choose = async checked => {
    const saved = await updateConsent(checked ? ANALYTICS_CONSENT.GRANTED : ANALYTICS_CONSENT.DENIED);
    setSaveFailed(!saved);
  };

  return (
    <Popover>
      <PopoverTrigger
        className={`${className} privacy-popover-trigger`}
        aria-label={COPY.name}
        title={COPY.name}
      >
        <ShieldCheck size={17} aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" className="privacy-popover">
        <PopoverTitle className="privacy-popover-title">{COPY.name}</PopoverTitle>
        <PopoverDescription className="privacy-popover-lede">{COPY.lede}</PopoverDescription>
        <Label className="privacy-popover-switch">
          {COPY.toggle}
          <Switch
            checked={consent === ANALYTICS_CONSENT.GRANTED}
            aria-label={COPY.toggle}
            onCheckedChange={choose}
          />
        </Label>
        <p role="status" className={`privacy-popover-status${saveFailed ? ' is-failed' : ''}`}>
          {saveFailed ? COPY.saveFailed : COPY.kept}
        </p>
        {/* A link that looks like a ghost button, not a Button rendered as a
            link: Base UI gives a non-button element `role="button"`, and this
            one navigates. */}
        <a
          href="/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'privacy-popover-policy')}
        >
          {COPY.policy}
          <ArrowUpRight size={14} aria-hidden="true" />
          <span className="visually-hidden">{COPY.newTab}</span>
        </a>
      </PopoverContent>
    </Popover>
  );
}
