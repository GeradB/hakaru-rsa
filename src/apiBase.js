/** Backend origin for API calls. Prefer VITE_API_BASE_URL; VITE_API_URL is accepted for CI parity with membership pages. */
export function apiUrl(path) {
  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
  const base = String(raw).replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

/**
 * JSON fetch with clear errors when the server returns HTML (404 page, proxy mismatch, etc.).
 */
export async function fetchApiJson(path, init = {}) {
  const url = apiUrl(path);
  const { headers: extraHeaders, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    const hint =
      res.status === 404
        ? 'API returned 404. Deploy the latest backend (includes POST /api/donation/submit). In GitHub: Actions → Deploy Backend to Azure App Service → Run workflow.'
        : `API returned a non-JSON response (HTTP ${res.status}). Check VITE_API_BASE_URL / VITE_API_URL.`;
    throw new Error(hint);
  }
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
}
