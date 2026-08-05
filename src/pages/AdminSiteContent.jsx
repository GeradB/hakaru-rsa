import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiUrl } from '../apiBase';
import { signOutAdmin } from '../lib/adminSignOut';
import { cloneJson } from '../lib/cmsPath';
import { hasCmsFormSchema } from '../lib/cmsFormSchema';
import CmsFragmentForm from '../components/admin/CmsFragmentForm';

const CMS_SLUG_LABELS = {
  global: 'Global (site name, navigation, footer)',
  home: 'Home (hero, welcome, announcements, events teaser, CTA)',
  about: 'About (including sponsors)',
  membership: 'Membership',
  contact: 'Contact',
  projects: 'Projects',
  events: 'Events page (headings — weekly list uses Home → What’s On)',
  committee: 'Committee',
  donate: 'Donate (titles & intro text)',
  newsletter: 'Newsletter (page titles & intro text)',
  lsa: 'LSA / Veteran Support',
};

const CMS_SLUG_ORDER = Object.keys(CMS_SLUG_LABELS);

export default function AdminSiteContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminLoginHref = `/admin/login?returnUrl=${encodeURIComponent(location.pathname)}`;
  const [slugs, setSlugs] = useState([]);
  const [slug, setSlug] = useState('global');
  const [fragment, setFragment] = useState({});
  const [jsonText, setJsonText] = useState('{}');
  const [editorMode, setEditorMode] = useState('form'); // 'form' | 'json'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const formAvailable = hasCmsFormSchema(slug);

  const displaySlugs = useMemo(() => {
    const fromApi = Array.isArray(slugs) ? slugs : [];
    const set = new Set([...CMS_SLUG_ORDER, ...fromApi]);
    const ordered = CMS_SLUG_ORDER.filter((s) => set.has(s));
    const extras = fromApi.filter((s) => !CMS_SLUG_ORDER.includes(s));
    return [...ordered, ...extras];
  }, [slugs]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('entraIdToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const applyFragment = useCallback((next) => {
    const cloned = cloneJson(next && typeof next === 'object' ? next : {}) || {};
    setFragment(cloned);
    setJsonText(JSON.stringify(cloned, null, 2));
  }, []);

  const loadSlug = useCallback(
    async (s) => {
      const res = await fetch(apiUrl(`/api/admin/site-content/${s}`), {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('entraIdToken');
        navigate(adminLoginHref, { replace: true });
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load');
      }
      const data = await res.json();
      applyFragment(data.fragment || {});
    },
    [navigate, adminLoginHref, applyFragment],
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
          navigate(adminLoginHref, { replace: true });
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
  }, [navigate, adminLoginHref]);

  useEffect(() => {
    if (!slug || loading) return;
    let cancelled = false;
    (async () => {
      try {
        setMessage(null);
        await loadSlug(slug);
        if (!cancelled) {
          setEditorMode(hasCmsFormSchema(slug) ? 'form' : 'json');
        }
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

  const syncJsonFromForm = () => {
    setJsonText(JSON.stringify(fragment, null, 2));
  };

  const syncFormFromJson = () => {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('JSON must be an object');
    }
    setFragment(cloneJson(parsed));
  };

  const switchMode = (mode) => {
    try {
      if (mode === 'json' && editorMode === 'form') {
        syncJsonFromForm();
      }
      if (mode === 'form' && editorMode === 'json') {
        syncFormFromJson();
      }
      setEditorMode(mode);
      setMessage(null);
    } catch {
      setMessage({
        type: 'error',
        text: 'Fix invalid JSON before switching to the form editor.',
      });
    }
  };

  const save = async () => {
    let payload;
    try {
      if (editorMode === 'json') {
        payload = JSON.parse(jsonText);
      } else {
        payload = fragment;
      }
    } catch {
      setMessage({ type: 'error', text: 'Invalid JSON — fix syntax before saving.' });
      return;
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      setMessage({ type: 'error', text: 'Content must be a JSON object.' });
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
      applyFragment(data.fragment || payload);
      setMessage({ type: 'ok', text: 'Saved. Public pages will show changes after refresh.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setMessage({ type: 'ok', text: 'JSON formatted.' });
    } catch {
      setMessage({ type: 'error', text: 'Cannot format — invalid JSON.' });
    }
  };

  const onUploadFile = async (file, setUrl) => {
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
      const url = data.publicUrl || '';
      if (!url) throw new Error('Upload succeeded but no URL was returned');
      setUrl(url);
      setMessage({ type: 'ok', text: 'Image uploaded and applied to the field.' });
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
              Edit page copy with forms. Upload images directly onto image fields.
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
              to="/admin/newsletters"
              className="rounded-lg border border-white/25 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/15"
            >
              Newsletters
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

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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
              {displaySlugs.map((s) => (
                <option key={s} value={s}>
                  {CMS_SLUG_LABELS[s] || s}
                </option>
              ))}
            </select>
          </div>

          <div
            className="inline-flex rounded-lg border border-white/20 bg-black/20 p-1"
            role="group"
            aria-label="Editor mode"
          >
            <button
              type="button"
              disabled={!formAvailable}
              onClick={() => switchMode('form')}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                editorMode === 'form'
                  ? 'bg-rsa-gold text-rsa-navy'
                  : 'text-gray-200 hover:bg-white/10 disabled:opacity-40'
              }`}
            >
              Form editor
            </button>
            <button
              type="button"
              onClick={() => switchMode('json')}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                editorMode === 'json'
                  ? 'bg-rsa-gold text-rsa-navy'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              Advanced JSON
            </button>
          </div>
        </div>

        {editorMode === 'form' ? (
          <CmsFragmentForm
            slug={slug}
            value={fragment}
            onChange={setFragment}
            uploading={uploading}
            onUploadFile={onUploadFile}
          />
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-400">
              Prefer the form editor when possible. JSON is for uncommon fields or troubleshooting.
            </p>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
              className="mb-4 min-h-[420px] w-full rounded-xl border border-white/15 bg-white/[0.97] p-4 font-mono text-sm text-gray-900 shadow-xl"
              aria-label="JSON content for selected section"
            />
          </>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-rsa-gold px-6 py-2.5 text-sm font-bold text-rsa-navy hover:bg-yellow-400 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save section'}
          </button>
          {editorMode === 'json' ? (
            <button
              type="button"
              onClick={formatJson}
              className="rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20"
            >
              Format JSON
            </button>
          ) : null}
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-gray-400">
          Pick a section, edit the labelled fields, upload images onto image fields, then save.
          Changes appear on the public site after a refresh. Weekly events live under{' '}
          <strong className="font-medium text-gray-300">Home → What’s On</strong>.
        </p>
      </div>
    </div>
  );
}
