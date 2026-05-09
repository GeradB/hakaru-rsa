import { useSiteContent } from '../context/SiteContentContext';

function sponsorLogoUrl(item) {
  const u = item?.logoUrl ?? item?.imageUrl;
  return typeof u === 'string' ? u.trim() : '';
}

export default function About() {
  const siteContent = useSiteContent();
  const { about } = siteContent;

  const introImg = about?.introImageUrl?.trim?.();
  const rnzrsaImg = about?.rnzrsa?.imageUrl?.trim?.();
  const sponsors = about?.sponsors;
  const sponsorItems = Array.isArray(sponsors?.items) ? sponsors.items : [];
  const showSponsors = sponsorItems.length > 0;

  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 text-center leading-tight">
          {about.title}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          {about.subtitle}
        </p>

        {/* Main About Content */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden mb-8">
          {introImg ? (
            <img src={introImg} alt="" className="w-full max-h-80 object-cover" />
          ) : null}
          <div className="p-8 md:p-12">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {about.content}
            </p>
          </div>
        </div>

        {/* RNZRSA Section */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden mb-8">
          {rnzrsaImg ? (
            <img src={rnzrsaImg} alt="" className="w-full max-h-72 object-cover" />
          ) : null}
          <div className="p-8 md:p-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-rsa-gold rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-rsa-navy" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1 0a7 7 0 100-14 7 7 0 000 14z" clipRule="evenodd" />
                  <path d="M10 6a1 1 0 110-2 1 1 0 010 2zM10 12a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold font-heading text-rsa-navy">
                {about.rnzrsa.title}
              </h2>
            </div>
            <div className="prose prose-lg max-w-none">
              {(about.rnzrsa?.content || '').split('\n\n').filter(Boolean).map((paragraph, idx) => (
                <p key={idx} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-rsa-navy border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold font-heading mb-8 text-rsa-gold text-center">
            {about.mission.title}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {(about.mission.items || []).map((item, index) => (
              <li key={index} className="flex items-start bg-white/5 rounded-lg p-4">
                <svg className="w-6 h-6 text-rsa-gold mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sponsors (CMS: about.sponsors in About slug JSON) */}
        {showSponsors && (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden mt-8">
            <div className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-rsa-navy text-center mb-2">
                {sponsors.title?.trim() || 'Our sponsors'}
              </h2>
              {sponsors.intro?.trim?.() ? (
                <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
                  {sponsors.intro.trim()}
                </p>
              ) : (
                <div className="mb-10" aria-hidden />
              )}
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 list-none p-0 m-0 items-center justify-items-center">
                {sponsorItems.map((item, index) => {
                  const logo = sponsorLogoUrl(item);
                  const name = typeof item?.name === 'string' ? item.name.trim() : '';
                  const href =
                    typeof item?.href === 'string'
                      ? item.href.trim()
                      : typeof item?.link === 'string'
                        ? item.link.trim()
                        : '';
                  const alt =
                    typeof item?.alt === 'string' && item.alt.trim()
                      ? item.alt.trim()
                      : name || 'Sponsor';
                  const inner = logo ? (
                    <img
                      src={logo}
                      alt={alt}
                      className="max-h-16 md:max-h-20 w-full max-w-[180px] object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-rsa-navy font-semibold text-center text-sm md:text-base">
                      {name || 'Sponsor'}
                    </span>
                  );
                  return (
                    <li key={index} className="flex w-full justify-center">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-[5rem] w-full max-w-[200px] items-center justify-center rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-6 shadow-sm transition hover:border-rsa-gold/50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-rsa-gold"
                        >
                          {inner}
                        </a>
                      ) : (
                        <div className="flex min-h-[5rem] w-full max-w-[200px] items-center justify-center rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-6 shadow-sm">
                          {inner}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
