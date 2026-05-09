import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../apiBase';
import { signOutAdmin } from '../lib/adminSignOut';

const CMS_SLUG_LABELS = {
  global: 'Global (site name, navigation, footer)',
  home: 'Home (hero, welcome, announcements, events teaser, CTA)',
  about: 'About (nest sponsors under about → sponsors)',
  membership: 'Membership',
  contact: 'Contact',
  projects: 'Projects',
  events: 'Events page (headings — weekly list uses Home → What’s On)',
  committee: 'Committee',
  donate: 'Donate (titles & intro text)',
};

export default function AdminSiteContent() {
  const navigate = useNavigate();
  const [slugs, setSlugs] = useState([]);
  const [slug, setSlug] = useState('global');
  const [jsonText, setJsonText] = useState('{}');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [lastUploadUrl, setLastUploadUrl] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('entraIdToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadSlug = useCallback(
    async (s) => {
      const res = await fetch(apiUrl(`/api/admin/site-content/${s}`), {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('entraIdToken');
        navigate('/admin/login', { replace: true });
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load');
      }
      const data = await res.json();
      setJsonText(JSON.stringify(data.fragment || {}, null, 2));
    },
    [navigate],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/admin/site-content/slugs'), {
          credentials: 'include',
          headers: getAuthHeaders(),
        });
        if (res.status === 401) {
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('entraIdToken');
          navigate('/admin/login', { replace: true });
          return;
        }
        const data = await res.json();
        if (!cancelled) setSlugs(data.slugs || []);
      } catch (e) {
        if (!cancelled) setMessage({ type: 'error', text: e.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (!slug || loading) return;
    let cancelled = false;
    (async () => {
      try {
        setMessage(null);
        await loadSlug(slug);
      } catch (e) {
        if (!cancelled) setMessage({ type: 'error', text: e.message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, loading, loadSlug]);

  const logout = () => {
    signOutAdmin().catch(() => {
      window.location.assign('/admin/login');
    });
  };

  const save = async () => {
    let payload;
    try {
      payload = JSON.parse(jsonText);
    } catch {
      setMessage({ type: 'error', text: 'Invalid JSON — fix syntax before saving.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(apiUrl(`/api/admin/site-content/${slug}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setJsonText(JSON.stringify(data.fragment || payload, null, 2));
      setMessage({ type: 'ok', text: 'Saved. Public pages will show changes after refresh.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const formatJson = () => {
    try {
      setJsonText(JSON.stringify(JSON.parse(jsonText), null, 2));
      setMessage({ type: 'ok', text: 'JSON formatted.' });
    } catch {
      setMessage({ type: 'error', text: 'Cannot format — invalid JSON.' });
    }
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(apiUrl('/api/admin/site-content/upload'), {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setLastUploadUrl(data.publicUrl || '');
      setMessage({
        type: 'ok',
        text: 'Image uploaded. Copy the URL below into any imageUrl field in the JSON.',
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rsa-navy via-slate-900 to-rsa-navy flex items-center justify-center text-gray-300">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rsa-navy via-slate-900 to-rsa-navy pb-16">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-rsa-navy/90 backdrop-blur-md shadow-lg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-white md:text-2xl">
              Site content
            </h1>
            <p className="text-xs text-gray-400 md:text-sm">
              Edit JSON per section. Use image URL fields for photos (upload first, then paste).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/gallery"
              className="rounded-lg border border-white/25 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/15"
            >
              Gallery admin
            </Link>
            <Link
              to="/"
              className="rounded-lg border border-white/25 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/15"
            >
              Site home
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-red-400/30 bg-white/5 px-3 py-2 text-sm text-red-200 hover:bg-red-950/40"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-8">
        {message && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 ${
              message.type === 'error'
                ? 'border-red-300/50 bg-red-950/40 text-red-100'
                : 'border-emerald-400/40 bg-emerald-950/35 text-emerald-50'
            }`}
            role="status"
          >
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="cms-slug" className="mb-1 block text-xs font-semibold text-rsa-gold">
              Section
            </label>
            <select
              id="cms-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full max-w-xl rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-rsa-navy"
            >
              {slugs.map((s) => (
                <option key={s} value={s}>
                  {s} — {CMS_SLUG_LABELS[s] || ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-rsa-gold">
              Upload image (JPEG/PNG/WebP)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={onUpload}
              className="block w-full text-sm text-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-rsa-gold file:px-3 file:py-2 file:text-sm file:font-bold file:text-rsa-navy"
            />
          </div>
        </div>

        {lastUploadUrl && (
          <div className="mb-4 rounded-lg border border-rsa-gold/40 bg-black/20 p-3">
            <p className="text-xs text-gray-400 mb-1">Last uploaded URL (copy into JSON):</p>
            <code className="break-all text-sm text-rsa-gold">{lastUploadUrl}</code>
          </div>
        )}

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          spellCheck={false}
          className="mb-4 min-h-[420px] w-full rounded-xl border border-white/15 bg-white/[0.97] p-4 font-mono text-sm text-gray-900 shadow-xl"
          aria-label="JSON content for selected section"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-rsa-gold px-6 py-2.5 text-sm font-bold text-rsa-navy hover:bg-yellow-400 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save section'}
          </button>
          <button
            type="button"
            onClick={formatJson}
            className="rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20"
          >
            Format JSON
          </button>
        </div>

        <p className="mt-8 text-sm text-gray-400 max-w-3xl leading-relaxed">
          Run <code className="text-rsa-gold">server/migrations/002_cms_content.sql</code> on your
          database if this is the first time. Image URLs must be HTTPS and publicly readable (same
          Azure container as the gallery). For rich layouts, use optional fields like{' '}
          <code className="text-white">hero.imageUrl</code>,{' '}
          <code className="text-white">welcome.imageUrl</code>,{' '}
          <code className="text-white">about.introImageUrl</code>,{' '}
          <code className="text-white">committeePage.members[].imageUrl</code>.
        </p>
      </div>
    </div>
  );
}
