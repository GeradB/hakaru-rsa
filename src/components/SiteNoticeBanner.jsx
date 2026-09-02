import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActiveSiteNotices } from '../config/siteNotices';

const DISMISS_KEY_PREFIX = 'hakaru-notice-dismissed-';

function NoticeFlagIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 3v18h2V13h11.5l-2.5-3 2.5-3H6V3H4z" />
    </svg>
  );
}

export default function SiteNoticeBanner() {
  const notices = getActiveSiteNotices();
  const [expanded, setExpanded] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(() => new Set());

  useEffect(() => {
    const stored = notices
      .map((notice) => notice.id)
      .filter((id) => localStorage.getItem(`${DISMISS_KEY_PREFIX}${id}`) === '1');
    setDismissedIds(new Set(stored));
  }, [notices]);

  const visible = notices.filter((notice) => !dismissedIds.has(notice.id));
  if (!visible.length) return null;

  const notice = visible[0];

  const dismiss = () => {
    localStorage.setItem(`${DISMISS_KEY_PREFIX}${notice.id}`, '1');
    setDismissedIds((prev) => new Set(prev).add(notice.id));
  };

  return (
    <div
      className="relative z-40 border-b-4 border-rsa-gold bg-gradient-to-r from-rsa-red via-[#8b1538] to-rsa-red text-white shadow-lg"
      role="region"
      aria-label="Important notice"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-rsa-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-rsa-navy shadow-md animate-pulse">
            <NoticeFlagIcon />
            Notice
          </span>

          <div className="min-w-0 flex-1">
            <p className="font-heading text-base md:text-lg font-bold leading-snug">
              {notice.title}
            </p>
            <p className="text-sm text-white/90 hidden sm:block">{notice.summary}</p>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              className="rounded-md border-2 border-white/80 bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20 focus:ring-4 focus:ring-white/40"
              aria-expanded={expanded}
            >
              {expanded ? 'Hide advert' : 'View advert'}
            </button>
            <Link
              to={notice.contactHref}
              className="rounded-md bg-rsa-gold px-4 py-2 text-sm font-bold text-rsa-navy hover:bg-yellow-300 focus:ring-4 focus:ring-rsa-gold/50"
            >
              {notice.contactLabel}
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white focus:ring-4 focus:ring-white/40"
              aria-label="Dismiss notice"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {expanded ? (
          <div className="mt-4 overflow-hidden rounded-xl border-2 border-white/30 bg-black/20 shadow-2xl">
            <img
              src={notice.imageSrc}
              alt={notice.imageAlt}
              className="mx-auto block h-auto w-full max-w-3xl"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
