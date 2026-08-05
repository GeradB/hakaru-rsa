import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiUrl } from '../apiBase';
import { signOutAdmin } from '../lib/adminSignOut';
import { cloneJson } from '../lib/cmsPath';
import {
  CMS_FRAGMENT_KEYS,
  CMS_SLUG_PREVIEW,
  hasCmsFormSchema,
} from '../lib/cmsFormSchema';
import CmsFragmentForm from '../components/admin/CmsFragmentForm';
import CmsLivePreview from '../components/admin/CmsLivePreview';
import fallbackSiteContent from '../../shared/siteContent.defaults.js';

const CMS_SLUG_ORDER = Object.keys(CMS_SLUG_PREVIEW);

function deepMerge(target, source) {
  if (source === null || typeof source !== 'object' || Array.isArray(source)) {
    return source;
  }
  const base =
    target && typeof target === 'object' && !Array.isArray(target) ? { ...target } : {};
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = base[key];
    if (
      sv !== null &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv !== null &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      base[key] = deepMerge(tv, sv);
    } else {
      base[key] = sv;
    }
  }
  return base;
}

function applyFragmentToBase(base, slug, fragment) {
  const keys = CMS_FRAGMENT_KEYS[slug] || [];
  const next = cloneJson(base) || {};
  for (const key of keys) {
    if (fragment && fragment[key] !== undefined) {
      next[key] = cloneJson(fragment[key]);
    }
  }
  return next;
}

export default function AdminSiteContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminLoginHref = `/admin/login?returnUrl=${encodeURIComponent(location.pathname)}`;
  const [slugs, setSlugs] = useState([]);
  const [slug, setSlug] = useState('home');
  const [baseContent, setBaseContent] = useState(fallbackSiteContent);
  const [fragment, setFragment] = useState({});
  const [jsonText, setJsonText] = useState('{}');
  const [editorMode, setEditorMode] = useState('form');
  const [mobilePane, setMobilePane] = useState('edit'); // 'edit' | 'preview'
  const [viewport, setViewport] = useState('desktop');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [dirty, setDirty] = useState(false);

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

  const draftFragment = useMemo(() => {
    if (editorMode !== 'json') return fragment;
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      /* keep last good fragment for preview */
    }
    return fragment;
  }, [editorMode, fragment, jsonText]);

  const previewContent = useMemo(
    () => applyFragmentToBase(baseContent, slug, draftFragment),
    [baseContent, slug, draftFragment],
  );
  const deferredPreview = useDeferredValue(previewContent);

  const applyFragment = useCallback((next) => {
    const cloned = cloneJson(next && typeof next === 'object' ? next : {}) || {};
    setFragment(cloned);
    setJsonText(JSON.stringify(cloned, null, 2));
    setDirty(false);
  }, []);

  const updateFragment = useCallback((next) => {
    setFragment(next);
    setDirty(true);
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
        const [slugsRes, contentRes] = await Promise.all([
          fetch(apiUrl('/api/admin/site-content/slugs'), {
            credentials: 'include',
            headers: getAuthHeaders(),
          }),
          fetch(apiUrl('/api/site-content')),
        ]);
        if (slugsRes.status === 401) {
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('entraIdToken');
          navigate(adminLoginHref, { replace: true });
          return;
        }
        const slugsData = await slugsRes.json();
        if (!cancelled) setSlugs(slugsData.slugs || []);
        if (contentRes.ok) {
          const full = await contentRes.json();
          if (!cancelled && full && typeof full === 'object') {
            setBaseContent(deepMerge(fallbackSiteContent, full));
          }
        }
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
          setMobilePane('edit');
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

  const switchMode = (mode) => {
    try {
      if (mode === 'json' && editorMode === 'form') {
        setJsonText(JSON.stringify(fragment, null, 2));
      }
      if (mode === 'form' && editorMode === 'json') {
        const parsed = JSON.parse(jsonText);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('JSON must be an object');
        }
        setFragment(cloneJson(parsed));
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
      setBaseContent((prev) => applyFragmentToBase(prev, slug, data.fragment || payload));
      setMessage({
        type: 'ok',
        text: 'Saved and published. Live preview matches the public site after visitors refresh.',
      });
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
      setDirty(true);
      setMessage({ type: 'ok', text: 'Image uploaded — check the live preview.' });
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

  const previewMeta = CMS_SLUG_PREVIEW[slug];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rsa-navy via-slate-900 to-rsa-navy pb-16">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-rsa-navy/90 backdrop-blur-md shadow-lg">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-white md:text-2xl">
              Site content
            </h1>
            <p className="text-xs text-gray-400 md:text-sm">
              Edit labelled fields and watch the live page preview update as you type.
              {dirty ? (
                <span className="ml-2 text-amber-300">Unsaved changes</span>
              ) : null}
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
              to={previewMeta?.path || '/'}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/25 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/15"
            >
              Open live page
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

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 pt-6">
        {message && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 ${
              message.type === 'error'
                ? 'border-red-300/50 bg-red-950/40 text-red-100'
                : 'border-emerald-400/40 bg-emerald-950/35 text-emerald-50'
            }`}
            role="status"
          >
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Page picker — reflective of site sections */}
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rsa-gold">
            Choose a page to edit
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {displaySlugs.map((s) => {
              const meta = CMS_SLUG_PREVIEW[s] || { title: s, subtitle: s };
              const active = s === slug;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (dirty && !window.confirm('Discard unsaved changes for this section?')) {
                      return;
                    }
                    setSlug(s);
                  }}
                  className={`min-w-[9.5rem] shrink-0 rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? 'border-rsa-gold bg-rsa-gold/15 text-white shadow-lg'
                      : 'border-white/15 bg-white/5 text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <span className="block text-sm font-semibold">{meta.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-gray-400">
                    {meta.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex rounded-lg border border-white/20 bg-black/20 p-1 lg:hidden"
            role="group"
            aria-label="Edit or preview"
          >
            <button
              type="button"
              onClick={() => setMobilePane('edit')}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                mobilePane === 'edit' ? 'bg-rsa-gold text-rsa-navy' : 'text-gray-200'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setMobilePane('preview')}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                mobilePane === 'preview' ? 'bg-rsa-gold text-rsa-navy' : 'text-gray-200'
              }`}
            >
              Preview
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-lg border border-white/20 bg-black/20 p-1"
              role="group"
              aria-label="Preview size"
            >
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  viewport === 'desktop' ? 'bg-white/20 text-white' : 'text-gray-300'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  viewport === 'mobile' ? 'bg-white/20 text-white' : 'text-gray-300'
                }`}
              >
                Mobile
              </button>
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
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  editorMode === 'form'
                    ? 'bg-rsa-gold text-rsa-navy'
                    : 'text-gray-200 disabled:opacity-40'
                }`}
              >
                Easy edit
              </button>
              <button
                type="button"
                onClick={() => switchMode('json')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  editorMode === 'json' ? 'bg-rsa-gold text-rsa-navy' : 'text-gray-200'
                }`}
              >
                Advanced JSON
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
          <div className={mobilePane === 'preview' ? 'hidden xl:block' : ''}>
            {editorMode === 'form' ? (
              <CmsFragmentForm
                slug={slug}
                value={fragment}
                onChange={updateFragment}
                uploading={uploading}
                onUploadFile={onUploadFile}
              />
            ) : (
              <>
                <p className="mb-3 text-sm text-gray-400">
                  Prefer Easy edit when possible. JSON is for troubleshooting only.
                </p>
                <textarea
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setDirty(true);
                  }}
                  spellCheck={false}
                  className="min-h-[420px] w-full rounded-xl border border-white/15 bg-white/[0.97] p-4 font-mono text-sm text-gray-900 shadow-xl"
                  aria-label="JSON content for selected section"
                />
              </>
            )}

            <div className="sticky bottom-4 mt-6 flex flex-wrap gap-3 rounded-xl border border-white/10 bg-rsa-navy/95 p-3 shadow-2xl backdrop-blur">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-rsa-gold px-6 py-2.5 text-sm font-bold text-rsa-navy hover:bg-yellow-400 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save & publish'}
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
              <button
                type="button"
                className="rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 xl:hidden"
                onClick={() => setMobilePane('preview')}
              >
                Show preview
              </button>
            </div>
          </div>

          <div
            className={`xl:sticky xl:top-24 xl:self-start ${
              mobilePane === 'edit' ? 'hidden xl:block' : ''
            }`}
          >
            <CmsLivePreview
              slug={slug}
              content={deferredPreview}
              viewport={viewport}
            />
          </div>
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-gray-400">
          The preview uses the real website layout. Edit on the left, confirm on the right, then
          Save &amp; publish. Weekly event cards are under{' '}
          <strong className="font-medium text-gray-300">Home</strong>.
        </p>
      </div>
    </div>
  );
}
