/** Backend origin for API calls. Set VITE_API_BASE_URL (e.g. http://localhost:3001) in `.env`. */
export function apiUrl(path) {
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
