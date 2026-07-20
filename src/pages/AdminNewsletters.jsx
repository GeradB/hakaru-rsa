import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiUrl } from '../apiBase';
import { signOutAdmin } from '../lib/adminSignOut';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-rsa-gold focus:outline-none focus:ring-2 focus:ring-rsa-gold/35';

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-rsa-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rsa-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const btnGhost =
  'inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-rsa-gold';

const btnDanger =
  'inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400';

const btnSecondary =
  'inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rsa-gold/40';

function formatIssueDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-NZ', { year: 'numeric', month: 'short', day: 'numeric' });
}

function toDateInputValue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function AdminNewsletters() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminLoginHref = `/admin/login?returnUrl=${encodeURIComponent(location.pathname)}`;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    publishedAt: new Date().toISOString().slice(0, 10),
    isPublished: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const getAuthHeaders = () => {
    const token = localStorage.getItem('entraIdToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const load = useCallback(async () => {
    const res = await fetch(apiUrl('/api/admin/newsletters'), {
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('entraIdToken');
      navigate(adminLoginHref, { replace: true });
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to load newsletters');
    }
    const data = await res.json();
    setItems(data.items || []);
  }, [navigate, adminLoginHref]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!cancelled) setMessage({ type: 'error', text: e.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const logout = () => {
    signOutAdmin().catch(() => {
      window.location.assign('/admin/login');
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Choose a PDF file first.' });
      return;
    }
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required.' });
      return;
    }

    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append('pdf', file);
      body.append('title', form.title.trim());
      body.append('description', form.description.trim());
      body.append('publishedAt', form.publishedAt || '');
      body.append('isPublished', form.isPublished ? 'true' : 'false');

      const res = await fetch(apiUrl('/api/admin/newsletters/upload'), {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setMessage({ type: 'ok', text: 'Newsletter uploaded.' });
      setFile(null);
      setForm({
        title: '',
        description: '',
        publishedAt: new Date().toISOString().slice(0, 10),
        isPublished: true,
      });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      publishedAt: toDateInputValue(item.publishedAt),
      isPublished: !!item.isPublished,
    });
  };

  const saveEdit = async (id) => {
    setMessage(null);
    try {
      const res = await fetch(apiUrl(`/api/admin/newsletters/${id}`), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          publishedAt: editForm.publishedAt || null,
          isPublished: !!editForm.isPublished,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setEditingId(null);
      setMessage({ type: 'ok', text: 'Newsletter updated.' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Update failed' });
    }
  };

  const removeItem = async (id) => {
    if (!window.confirm('Delete this newsletter and its PDF?')) return;
    setMessage(null);
    try {
      const res = await fetch(apiUrl(`/api/admin/newsletters/${id}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setMessage({ type: 'ok', text: 'Newsletter deleted.' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Delete failed' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rsa-navy via-slate-900 to-rsa-navy text-white">
      <header className="border-b border-white/10 bg-rsa-navy/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rsa-gold">Admin</p>
            <h1 className="font-heading text-2xl font-bold">Newsletters</h1>
            <p className="mt-1 text-sm text-gray-300">Upload PDF issues for the public newsletter page.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin/gallery" className={btnGhost}>
              Gallery
            </Link>
            <Link to="/admin/site-content" className={btnGhost}>
              Site content
            </Link>
            <Link to="/newsletter" className={btnGhost}>
              Public page
            </Link>
            <button
              type="button"
              onClick={logout}
              className={`${btnGhost} border-red-400/30 text-red-200 hover:bg-red-950/40`}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {message && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              message.type === 'error'
                ? 'border-red-300/50 bg-red-950/40 text-red-100'
                : 'border-emerald-400/40 bg-emerald-950/35 text-emerald-50'
            }`}
            role="status"
          >
            {message.text}
          </div>
        )}

        <section className="mb-10 rounded-2xl border border-white/10 bg-white p-6 text-gray-900 shadow-xl">
          <h2 className="mb-4 font-heading text-xl font-bold text-rsa-navy">Upload newsletter PDF</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-rsa-navy">Title</label>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. July 2026 Newsletter"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-rsa-navy">Short description (optional)</label>
              <textarea
                className={inputClass}
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief summary shown on the public page"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-rsa-navy">Publish date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.publishedAt}
                  onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-semibold text-rsa-navy">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-rsa-navy focus:ring-rsa-gold"
                  />
                  Published on website
                </label>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-rsa-navy">PDF file</label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-rsa-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? <p className="mt-1 text-xs text-gray-500">{file.name}</p> : null}
            </div>
            <button type="submit" disabled={uploading} className={btnPrimary}>
              {uploading ? 'Uploading…' : 'Upload newsletter'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/95 p-6 text-gray-900 shadow-xl">
          <h2 className="mb-4 font-heading text-xl font-bold text-rsa-navy">All newsletters</h2>
          {loading ? (
            <p className="text-gray-600">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-gray-600">No newsletters yet.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <input
                        className={inputClass}
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      />
                      <textarea
                        className={inputClass}
                        rows={2}
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      />
                      <div className="flex flex-wrap items-center gap-4">
                        <input
                          type="date"
                          className={inputClass + ' max-w-[12rem]'}
                          value={editForm.publishedAt}
                          onChange={(e) => setEditForm((f) => ({ ...f, publishedAt: e.target.value }))}
                        />
                        <label className="flex items-center gap-2 text-sm font-semibold">
                          <input
                            type="checkbox"
                            checked={editForm.isPublished}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, isPublished: e.target.checked }))
                            }
                          />
                          Published
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className={btnPrimary} onClick={() => saveEdit(item.id)}>
                          Save
                        </button>
                        <button type="button" className={btnSecondary} onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-heading text-lg font-bold text-rsa-navy">{item.title}</p>
                        <p className="text-sm text-gray-500">
                          {formatIssueDate(item.publishedAt || item.createdAt)}
                          {' · '}
                          {item.isPublished ? (
                            <span className="font-semibold text-emerald-700">Published</span>
                          ) : (
                            <span className="font-semibold text-amber-700">Draft</span>
                          )}
                        </p>
                        {item.description ? (
                          <p className="mt-1 text-sm text-gray-700">{item.description}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={item.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={btnSecondary}
                        >
                          Open PDF
                        </a>
                        <button type="button" className={btnSecondary} onClick={() => startEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className={btnDanger} onClick={() => removeItem(item.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
