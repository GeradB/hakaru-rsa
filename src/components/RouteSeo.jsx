import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { getSeoForPath } from '../seo/routeMeta';
import { absoluteUrl, getPublicSiteOrigin } from '../lib/publicSiteUrl';

function normalizePathname(pathname) {
  if (!pathname || pathname === '/') return '/';
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  return trimmed;
}

export default function RouteSeo() {
  const { pathname } = useLocation();
  const path = normalizePathname(pathname);
  const { title, description, noindex } = getSeoForPath(pathname);
  const canonical = absoluteUrl(path === '/' ? '/' : path);
  const origin = getPublicSiteOrigin();
  const ogImage = import.meta.env.VITE_PUBLIC_OG_IMAGE_URL?.trim();

  const organizationJsonLd = useMemo(
    () =>
      noindex
        ? null
        : {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Hakaru RSA',
            alternateName: 'Hakaru & Districts Returned and Services Association',
            url: origin,
            description:
              'Supporting veterans, active service members, and families in the Hakaru district and North Waikato.',
          },
    [noindex, origin],
  );

  return (
    <Helmet
      prioritizeSeoTags
      htmlAttributes={{ lang: 'en-NZ' }}
    >
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Hakaru RSA" />
      <meta property="og:locale" content="en_NZ" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {organizationJsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(organizationJsonLd)}
        </script>
      ) : null}
    </Helmet>
  );
}
