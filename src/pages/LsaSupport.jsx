import { Link } from 'react-router-dom';
import { useSiteContent } from '../context/SiteContentContext';

function HelpItemBody({ item }) {
  const body = typeof item?.body === 'string' ? item.body.trim() : '';
  const linkText = typeof item?.linkText === 'string' ? item.linkText.trim() : '';
  const linkUrl = typeof item?.linkUrl === 'string' ? item.linkUrl.trim() : '';

  if (linkText && linkUrl) {
    return (
      <>
        {body ? `${body} ` : null}
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rsa-navy font-semibold underline decoration-rsa-gold/60 underline-offset-2 hover:text-rsa-gold"
        >
          {linkText}
        </a>
        .
      </>
    );
  }
  return <>{body}</>;
}

export default function LsaSupport() {
  const { lsaPage } = useSiteContent();
  const page = lsaPage || {};

  const introParagraphs = Array.isArray(page.introParagraphs) ? page.introParagraphs : [];
  const helpItems = Array.isArray(page.helpItems) ? page.helpItems : [];
  const enquiryEmails = Array.isArray(page.enquiryEmails) ? page.enquiryEmails : [];

  const address = page.address || '';
  const mapsQuery = page.addressMapsQuery || address;
  const mapsUrl = mapsQuery
    ? `https://maps.google.com/?q=${encodeURIComponent(mapsQuery)}`
    : '';
  const mobileTel = (page.mobileTel || page.mobileDisplay || '').replace(/\s/g, '');
  const websiteHref = page.websiteHref || '/';

  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 text-center leading-tight">
          {page.title || "Veterans' Support & Local Support Advisor (LSA) Services"}
        </h1>
        {page.subtitle ? (
          <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto leading-relaxed">
            {page.subtitle}
          </p>
        ) : null}

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
          <h2 className="text-2xl font-bold font-heading text-rsa-navy mb-4">
            {page.servicesTitle || 'Veteran Support Services (LSA)'}
          </h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            {introParagraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <hr className="border-rsa-navy/15 my-8" />

          <h3 className="text-xl font-bold font-heading text-rsa-navy mb-5">
            {page.helpTitle || 'How Our Local Support Advisor Can Help'}
          </h3>
          <ul className="space-y-5">
            {helpItems.map((item, idx) => (
              <li key={`${item.title || 'help'}-${idx}`} className="flex items-start gap-3">
                <span
                  className="mt-2 w-2 h-2 rounded-full bg-rsa-gold flex-shrink-0"
                  aria-hidden="true"
                />
                <p className="text-gray-700 leading-relaxed">
                  {item.title ? (
                    <span className="font-bold text-rsa-navy">{item.title}:</span>
                  ) : null}{' '}
                  <HelpItemBody item={item} />
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-rsa-navy border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-rsa-gold mb-4">
            {page.contactTitle || 'Get in Touch'}
          </h2>
          {page.contactIntro ? (
            <p className="text-gray-200 leading-relaxed mb-8 max-w-2xl">{page.contactIntro}</p>
          ) : null}

          <ul className="space-y-5 text-white">
            {page.advisorName ? (
              <li className="flex flex-col sm:flex-row sm:gap-2 border-b border-white/10 pb-4">
                <span className="font-bold text-rsa-gold shrink-0 sm:min-w-[11rem]">
                  {page.advisorLabel || 'Local Support Advisor'}:
                </span>
                <span>{page.advisorName}</span>
              </li>
            ) : null}

            {address ? (
              <li className="flex flex-col sm:flex-row sm:gap-2 border-b border-white/10 pb-4">
                <span className="font-bold text-rsa-gold shrink-0 sm:min-w-[11rem]">
                  {page.addressLabel || 'Physical Address'}:
                </span>
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-200 hover:text-rsa-gold underline decoration-white/30 underline-offset-2 transition-colors"
                  >
                    {address}
                  </a>
                ) : (
                  <span className="text-gray-200">{address}</span>
                )}
              </li>
            ) : null}

            {page.mobileDisplay ? (
              <li className="flex flex-col sm:flex-row sm:gap-2 border-b border-white/10 pb-4">
                <span className="font-bold text-rsa-gold shrink-0 sm:min-w-[11rem]">
                  {page.mobileLabel || 'Direct Mobile'}:
                </span>
                <a
                  href={`tel:${mobileTel}`}
                  className="text-gray-200 hover:text-rsa-gold underline decoration-white/30 underline-offset-2 transition-colors"
                >
                  {page.mobileDisplay}
                </a>
              </li>
            ) : null}

            {enquiryEmails.length > 0 ? (
              <li className="flex flex-col sm:flex-row sm:gap-2 border-b border-white/10 pb-4">
                <span className="font-bold text-rsa-gold shrink-0 sm:min-w-[11rem]">
                  {page.enquiriesLabel || 'General Enquiries'}:
                </span>
                <span className="text-gray-200">
                  {enquiryEmails.map((email, idx) => (
                    <span key={email}>
                      {idx > 0 ? ' or ' : null}
                      <a
                        href={`mailto:${email}`}
                        className="hover:text-rsa-gold underline decoration-white/30 underline-offset-2 transition-colors"
                      >
                        {email}
                      </a>
                    </span>
                  ))}
                </span>
              </li>
            ) : null}

            {page.websiteText ? (
              <li className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-bold text-rsa-gold shrink-0 sm:min-w-[11rem]">
                  {page.websiteLabel || 'Official Website'}:
                </span>
                {websiteHref.startsWith('http') ? (
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-200 hover:text-rsa-gold underline decoration-white/30 underline-offset-2 transition-colors"
                  >
                    {page.websiteText}
                  </a>
                ) : (
                  <Link
                    to={websiteHref}
                    className="text-gray-200 hover:text-rsa-gold underline decoration-white/30 underline-offset-2 transition-colors"
                  >
                    {page.websiteText}
                  </Link>
                )}
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
