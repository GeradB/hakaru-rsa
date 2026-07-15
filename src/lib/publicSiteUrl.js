/** Default public origin (canonical host). Override with VITE_PUBLIC_SITE_URL in env. */
const DEFAULT_ORIGIN = 'https://www.hakarursa.co.nz';

/**
 * Absolute site origin for canonical URLs, Open Graph, and sitemap hints.
 * Set VITE_PUBLIC_SITE_URL to full base URL, e.g. https://hakarursa.co.nz
 */
export function getPublicSiteOrigin() {
  const raw = import.meta.env.VITE_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_ORIGIN;
  try {
    const u = new URL(raw);
    return u.origin;
  } catch {
    return DEFAULT_ORIGIN;
  }
}

export function absoluteUrl(pathname = '/') {
  const origin = getPublicSiteOrigin();
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}
