import { useEffect, useMemo, useRef, useState } from 'react';
import { SiteContentOverride } from '../../context/SiteContentContext';
import Header from '../Header';
import Footer from '../Footer';
import Home from '../../pages/Home';
import About from '../../pages/About';
import Membership from '../../pages/Membership';
import Contact from '../../pages/Contact';
import Projects from '../../pages/Projects';
import Events from '../../pages/Events';
import Committee from '../../pages/Committee';
import Donation from '../../pages/Donation';
import Newsletter from '../../pages/Newsletter';
import LsaSupport from '../../pages/LsaSupport';
import { CMS_SLUG_PREVIEW } from '../../lib/cmsFormSchema';

const PAGE_BY_SLUG = {
  global: Home,
  home: Home,
  about: About,
  membership: Membership,
  contact: Contact,
  projects: Projects,
  events: Events,
  committee: Committee,
  donate: Donation,
  newsletter: Newsletter,
  lsa: LsaSupport,
};

/**
 * Live WYSIWYG-style preview using the real page components + draft site content.
 */
export default function CmsLivePreview({ slug, content, viewport = 'desktop' }) {
  const Page = PAGE_BY_SLUG[slug] || Home;
  const meta = CMS_SLUG_PREVIEW[slug];
  const frameWidth = viewport === 'mobile' ? 390 : 1280;
  const shellRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(0.5);
  const [contentHeight, setContentHeight] = useState(900);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return undefined;
    const update = () => {
      const w = el.clientWidth - 24;
      if (w > 0) setScale(Math.min(1, w / frameWidth));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [frameWidth]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;
    const measure = () => setContentHeight(el.scrollHeight || 900);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [content, slug, viewport]);

  const previewTree = useMemo(
    () => (
      <SiteContentOverride content={content}>
        <div className="min-h-screen flex flex-col bg-white">
          <Header />
          <main className="flex-grow">
            <Page />
          </main>
          <Footer />
        </div>
      </SiteContentOverride>
    ),
    [content, Page],
  );

  return (
    <div className="flex h-full max-h-[calc(100vh-8rem)] min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-white/15 bg-black/30 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-rsa-gold">
            Live preview
          </p>
          <p className="text-sm text-gray-300">
            {meta?.title || slug}
            <span className="text-gray-500"> · updates as you type</span>
          </p>
        </div>
        {meta?.previewNote ? (
          <p className="max-w-xs text-xs text-gray-400">{meta.previewNote}</p>
        ) : null}
      </div>

      <div ref={shellRef} className="relative flex-1 overflow-auto bg-slate-950/80 p-3">
        <div
          className="mx-auto overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl"
          style={{
            width: Math.max(120, frameWidth * scale),
            height: Math.max(200, contentHeight * scale),
          }}
        >
          <div
            ref={contentRef}
            className="origin-top-left"
            style={{
              width: frameWidth,
              transform: `scale(${scale})`,
            }}
          >
            <div className="pointer-events-none select-none" aria-hidden>
              {previewTree}
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-gray-500">
          Preview only — links are disabled. Save &amp; publish when it looks right.
        </p>
      </div>
    </div>
  );
}
