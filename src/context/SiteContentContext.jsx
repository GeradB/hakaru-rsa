import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiUrl } from '../apiBase';
import fallback from '../../shared/siteContent.defaults.js';

const SiteContentContext = createContext({
  siteContent: fallback,
  siteContentReady: false,
});

export function SiteContentProvider({ children }) {
  const [data, setData] = useState(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl('/api/site-content'))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        if (!cancelled && json && typeof json === 'object') {
          setData(json);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      siteContent: data,
      siteContentReady: ready,
    }),
    [data, ready],
  );

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

/** Merged site copy (defaults + API). Static fallback until first fetch completes. */
export function useSiteContent() {
  const { siteContent } = useContext(SiteContentContext);
  return siteContent;
}

export function useSiteContentReady() {
  const { siteContentReady } = useContext(SiteContentContext);
  return siteContentReady;
}
