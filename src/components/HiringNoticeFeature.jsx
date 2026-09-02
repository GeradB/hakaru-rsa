import { getActiveSiteNotices } from '../config/siteNotices';

export default function HiringNoticeFeature() {
  const notice = getActiveSiteNotices()[0];
  if (!notice) return null;

  return (
    <section
      id="cook-wanted"
      className="relative -mt-8 pb-4 md:-mt-12"
      aria-labelledby="hiring-notice-heading"
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="overflow-hidden rounded-2xl border-4 border-rsa-gold bg-white shadow-2xl ring-4 ring-rsa-red/30">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-rsa-red px-4 py-3 text-white md:px-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-full bg-rsa-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-rsa-navy">
                Now hiring
              </span>
              <h2 id="hiring-notice-heading" className="font-heading text-lg md:text-xl font-bold">
                {notice.title}
              </h2>
            </div>
            <a
              href={notice.contactHref}
              className="rounded-md bg-rsa-gold px-4 py-2 text-sm font-bold text-rsa-navy hover:bg-yellow-300 focus:ring-4 focus:ring-rsa-gold/50"
            >
              {notice.contactLabel}
            </a>
          </div>
          <img
            src={notice.imageSrc}
            alt={notice.imageAlt}
            className="block h-auto w-full"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
