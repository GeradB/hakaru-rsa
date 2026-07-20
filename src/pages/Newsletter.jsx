import { useEffect, useState } from 'react';
import { apiUrl } from '../apiBase';
import { useSiteContent } from '../context/SiteContentContext';

function formatIssueDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Newsletter() {
  const siteContent = useSiteContent();
  const page = siteContent.newsletterPage || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/newsletters'));
        if (!res.ok) throw new Error('Could not load newsletters');
        const data = await res.json();
        if (!cancelled) setItems(data.items || []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load newsletters');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 text-center leading-tight">
          {page.pageTitle || 'Newsletter'}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          {page.pageSubtitle || 'News and updates from Hakaru & Districts RSA'}
        </p>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden mb-12 text-center">
          <div className="p-8">
            <h2 className="text-2xl font-bold font-heading text-rsa-navy mb-4">
              {page.introTitle || 'Stay informed'}
            </h2>
            <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
              {page.introBody ||
                'Browse our past newsletters for club news, upcoming events, and community updates. New issues are added here as they are published.'}
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold font-heading text-white mb-6">
          {page.listTitle || 'Previous newsletters'}
        </h2>

        {loading ? (
          <div className="bg-white/95 rounded-xl shadow-xl p-8 text-center text-gray-600">
            Loading newsletters…
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white/95 rounded-xl shadow-xl p-8 text-center text-gray-600">
            {page.emptyMessage || 'No newsletters published yet. Check back soon.'}
          </div>
        ) : (
          <div className="space-y-4 mb-12">
            {items.map((item) => {
              const dateLabel = formatIssueDate(item.publishedAt || item.createdAt);
              return (
                <div
                  key={item.id}
                  className="bg-white/95 backdrop-blur rounded-xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-2xl transition-shadow"
                >
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold font-heading text-rsa-navy mb-1">
                      {item.title}
                    </h3>
                    {dateLabel ? (
                      <p className="text-sm font-semibold text-rsa-gold mb-2">{dateLabel}</p>
                    ) : null}
                    {item.description ? (
                      <p className="text-gray-700 leading-relaxed">{item.description}</p>
                    ) : null}
                  </div>
                  <a
                    href={item.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center shrink-0 bg-rsa-navy text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    View PDF
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
