const STORAGE_KEY = 'adminPostLoginRedirect';

/** Only allow same-origin admin paths (avoid open redirects). */
export function safeAdminReturnPath(raw) {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/admin/')) return null;
  if (trimmed.startsWith('//')) return null;
  if (trimmed.includes('://')) return null;
  return trimmed;
}

export function rememberAdminReturnFromSearch(searchParams) {
  const raw = searchParams.get('returnUrl');
  const safe = safeAdminReturnPath(raw);
  if (safe) {
    try {
      sessionStorage.setItem(STORAGE_KEY, safe);
    } catch {
      /* ignore */
    }
  }
}

export function peekAdminReturnPath(fallback = '/admin/gallery') {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    return safeAdminReturnPath(v) || fallback;
  } catch {
    return fallback;
  }
}

export function consumeAdminReturnPath(fallback = '/admin/gallery') {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    return safeAdminReturnPath(v) || fallback;
  } catch {
    return fallback;
  }
}
