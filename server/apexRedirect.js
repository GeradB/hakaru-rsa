/**
 * Build a safe www redirect URL from an apex request path.
 * Rejects protocol-relative and absolute URLs that would open-redirect.
 */
export function buildSafeWwwRedirect(publicSiteOrigin, originalUrl) {
  const origin = String(publicSiteOrigin || '').replace(/\/+$/, '');
  const fallback = `${origin}/`;
  const raw = typeof originalUrl === 'string' ? originalUrl : '/';

  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return fallback;
  }

  try {
    const parsed = new URL(raw, 'http://local.invalid');
    if (parsed.host !== 'local.invalid' || parsed.username || parsed.password) {
      return fallback;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(parsed.pathname);
    } catch {
      return fallback;
    }

    if (!pathname.startsWith('/') || pathname.startsWith('//') || pathname.includes('\\')) {
      return fallback;
    }

    return `${origin}${pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
