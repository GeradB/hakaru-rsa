import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiUrl } from '../apiBase';
import { signOutAdmin } from '../lib/adminSignOut';

function rowKey(item) {
  return item.id;
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-rsa-gold focus:outline-none focus:ring-2 focus:ring-rsa-gold/35';

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-rsa-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rsa-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const btnGold =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-rsa-gold px-4 py-2.5 text-sm font-bold text-rsa-navy shadow-sm hover:bg-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rsa-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const btnGhost =
  'inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-rsa-gold';

const btnDanger =
  'inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400';

const btnSecondary =
  'inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rsa-gold/40';

export default function AdminGallery() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminLoginHref = `/admin/login?returnUrl=${encodeURIComponent(location.pathname)}`;
  const [albums, setAlbums] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState('all');
  const [showNewAlbumForm, setShowNewAlbumForm] = useState(false);
  const [newAlbum, setNewAlbum] = useState({
    name: '',
    description: '',
    sortOrder: 0,
    isPublished: true,
  });
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [editAlbumData, setEditAlbumData] = useState({});
  const isSiteImagesAlbum = (album) =>
    String(album?.name || '').trim().toLowerCase() === 'site images';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('entraIdToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const jsonAuthHeaders = () => ({
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  });

  const loadAlbums = useCallback(async () => {
    const res = await fetch(apiUrl('/api/admin/albums'), {
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
      throw new Error(data.error || 'Failed to load albums');
    }
    const data = await res.json();
    setAlbums(data.albums || []);
  }, [navigate, adminLoginHref]);

  const loadItems = useCallback(
    async (albumId = null) => {
      const path =
        albumId && albumId !== 'all'
          ? `/api/admin/gallery/album/${albumId}`
          : '/api/admin/gallery';
      const res = await fetch(apiUrl(path), {
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
        throw new Error(data.error || 'Failed to load gallery');
      }
      const data = await res.json();
      setItems(data.items || []);
    },
    [navigate, adminLoginHref],
  );

  const load = useCallback(async () => {
    await loadAlbums();
    await loadItems(selectedAlbumId === 'all' ? null : selectedAlbumId);
  }, [loadAlbums, loadItems, selectedAlbumId]);

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

  useEffect(() => {
    if (!message || message.type !== 'ok') return undefined;
    const t = setTimeout(() => setMessage(null), 4800);
    return () => clearTimeout(t);
  }, [message]);

  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true);
      await load();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const logout = () => {
    signOutAdmin().catch(() => {
      window.location.assign('/admin/login');
    });
  };

  const addFilesFromList = (fileList) => {
    const next = Array.from(fileList || []).filter((f) =>
      /image\/(jpeg|png|webp)/i.test(f.type),
    );
    if (next.length === 0 && fileList?.length) {
      setMessage({
        type: 'error',
        text: 'Only JPEG, PNG, or WebP images are allowed.',
      });
      return;
    }
    setFiles(next);
  };

  const updateLocal = (id, patch) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  };

  const saveRow = async (item) => {
    setMessage(null);
    try {
      const res = await fetch(apiUrl(`/api/admin/gallery/${item.id}`), {
        method: 'PUT',
        headers: jsonAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          title: item.title,
          caption: item.caption,
          sortOrder: item.sortOrder,
          isPublished: item.isPublished,
          albumId: item.albumId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setMessage({ type: 'ok', text: 'Saved changes.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm('Delete this photo from the gallery and blob storage?'))
      return;
    setMessage(null);
    try {
      const res = await fetch(apiUrl(`/api/admin/gallery/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setItems((prev) => prev.filter((it) => it.id !== id));
      setMessage({ type: 'ok', text: 'Photo removed.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const onUpload = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setMessage({ type: 'error', text: 'Choose one or more images first.' });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      for (const file of files) {
        fd.append('images', file);
      }
      if (selectedAlbumId && selectedAlbumId !== 'all') {
        fd.append('albumId', selectedAlbumId);
      }
      const res = await fetch(apiUrl('/api/admin/gallery/upload'), {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        navigate(adminLoginHref, { replace: true });
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setFiles([]);
      e.target.reset();
      await load();
      const albumLabel =
        albums.find((a) => String(a.id) === String(selectedAlbumId))?.name ||
        'Unsorted';
      setMessage({
        type: 'ok',
        text: `Uploaded ${data.count || files.length} image(s) to “${albumLabel}”.`,
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const createAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbum.name.trim()) {
      setMessage({ type: 'error', text: 'Album name is required.' });
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/admin/albums'), {
        method: 'POST',
        headers: jsonAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(newAlbum),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create album');
      setNewAlbum({ name: '', description: '', sortOrder: 0, isPublished: true });
      setShowNewAlbumForm(false);
      await load();
      setMessage({ type: 'ok', text: 'Album created.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const updateAlbum = async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/albums/${id}`), {
        method: 'PUT',
        headers: jsonAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(editAlbumData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update album');
      setEditingAlbumId(null);
      await load();
      setMessage({ type: 'ok', text: 'Album updated.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const deleteAlbum = async (id, name) => {
    if (
      !window.confirm(
        `Delete album “${name}”? Photos stay in the library but are unassigned from this album.`,
      )
    )
      return;
    try {
      const res = await fetch(apiUrl(`/api/admin/albums/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete album');
      if (String(selectedAlbumId) === String(id)) setSelectedAlbumId('all');
      await load();
      setMessage({ type: 'ok', text: 'Album deleted.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const selectedAlbumLabel =
    selectedAlbumId === 'all'
      ? 'All photos'
      : albums.find((a) => String(a.id) === String(selectedAlbumId))?.name ||
        'Photos';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rsa-navy via-slate-900 to-rsa-navy flex flex-col items-center justify-center gap-4 px-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-rsa-gold border-t-transparent"
          aria-hidden
        />
        <p className="text-gray-300 text-sm font-medium">Loading gallery admin…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rsa-navy via-slate-900 to-rsa-navy pb-16">
      <div className="fixed inset-0 pointer-events-none opacity-[0.06]">
        <div
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"
          aria-hidden
        />
      </div>

      {/* Sticky toolbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-rsa-navy/90 backdrop-blur-md shadow-lg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-white md:text-2xl">
              Gallery admin
            </h1>
            <p className="mt-0.5 text-xs text-gray-400 md:text-sm">
              Albums → upload → publish photos to the public gallery
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => refreshData()}
              disabled={refreshing}
              className={btnGhost}
            >
              <svg
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <Link to="/admin/site-content" className={btnGhost}>
              Site content
            </Link>
            <Link to="/admin/newsletters" className={btnGhost}>
              Newsletters
            </Link>
            <Link to="/gallery" className={btnGhost}>
              Public gallery
            </Link>
            <Link to="/" className={btnGhost}>
              Site home
            </Link>
            <button type="button" onClick={logout} className={`${btnGhost} border-red-400/30 text-red-200 hover:bg-red-950/40`}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-8">
        {/* Alerts */}
        {message && (
          <div
            className={`mb-6 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 shadow-lg ${
              message.type === 'error'
                ? 'border-red-300/50 bg-red-950/40 text-red-100'
                : 'border-emerald-400/40 bg-emerald-950/35 text-emerald-50'
            }`}
            role="status"
          >
            <p className="text-sm font-medium leading-snug">{message.text}</p>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 hover:bg-white/10"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Context strip */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-4 backdrop-blur-sm md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rsa-gold">
              Working set
            </p>
            <p className="text-lg font-semibold text-white">{selectedAlbumLabel}</p>
            <p className="text-sm text-gray-400">{items.length} photo(s) loaded</p>
          </div>
          <div className="min-w-[200px] flex-1 md:max-w-xs md:flex-none">
            <label htmlFor="admin-album-scope" className="sr-only">
              Filter photos by album
            </label>
            <select
              id="admin-album-scope"
              value={selectedAlbumId}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedAlbumId(v);
                loadItems(v);
              }}
              className={`${inputClass} bg-white font-medium`}
            >
              <option value="all">All photos (every album)</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Albums */}
        <section className="mb-10 rounded-2xl border border-white/15 bg-white/[0.97] p-6 shadow-xl backdrop-blur md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-rsa-navy">Albums</h2>
              <p className="mt-1 text-sm text-gray-600">
                Published albums appear on the public gallery. Use “Load photos” to jump here and in the filter above.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewAlbumForm(!showNewAlbumForm)}
              className={btnGold}
            >
              {showNewAlbumForm ? 'Close form' : '+ New album'}
            </button>
          </div>

          {showNewAlbumForm && (
            <form
              onSubmit={createAlbum}
              className="mb-8 space-y-4 rounded-xl border border-rsa-gold/30 bg-rsa-cream/40 p-5"
            >
              <h3 className="font-semibold text-rsa-navy">Create album</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newAlbum.name}
                    onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. ANZAC Day 2026"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Sort order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newAlbum.sortOrder}
                    onChange={(e) =>
                      setNewAlbum({
                        ...newAlbum,
                        sortOrder: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newAlbum.description}
                  onChange={(e) =>
                    setNewAlbum({ ...newAlbum, description: e.target.value })
                  }
                  rows={2}
                  className={inputClass}
                  placeholder="Optional short description"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={newAlbum.isPublished}
                  onChange={(e) =>
                    setNewAlbum({ ...newAlbum, isPublished: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-rsa-navy focus:ring-rsa-gold"
                />
                Published on public gallery
              </label>
              <button type="submit" className={btnPrimary}>
                Create album
              </button>
            </form>
          )}

          <ul className="space-y-3">
            {albums.map((album) => (
              <li
                key={album.id}
                className={`rounded-xl border p-4 transition-shadow ${
                  String(selectedAlbumId) === String(album.id)
                    ? 'border-rsa-gold bg-rsa-gold/10 shadow-md ring-1 ring-rsa-gold/40'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {editingAlbumId === album.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={editAlbumData.name ?? album.name}
                        onChange={(e) =>
                          setEditAlbumData({ ...editAlbumData, name: e.target.value })
                        }
                        className={inputClass}
                      />
                      <input
                        type="number"
                        min={0}
                        value={editAlbumData.sortOrder ?? album.sortOrder}
                        onChange={(e) =>
                          setEditAlbumData({
                            ...editAlbumData,
                            sortOrder: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <textarea
                      value={editAlbumData.description ?? album.description ?? ''}
                      onChange={(e) =>
                        setEditAlbumData({
                          ...editAlbumData,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className={inputClass}
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        disabled={isSiteImagesAlbum(album)}
                        checked={
                          editAlbumData.isPublished ??
                          album.is_published ??
                          album.isPublished ??
                          false
                        }
                        onChange={(e) =>
                          setEditAlbumData({
                            ...editAlbumData,
                            isPublished: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded"
                      />
                      Published {isSiteImagesAlbum(album) ? '(disabled for Site images)' : ''}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateAlbum(album.id)}
                        className={btnPrimary}
                      >
                        Save album
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAlbumId(null)}
                        className={btnSecondary}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-bold text-rsa-navy">
                          {album.name}
                        </h3>
                        {isSiteImagesAlbum(album) && (
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                            Site only
                          </span>
                        )}
                        {!(album.is_published ?? album.isPublished) && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                            Draft
                          </span>
                        )}
                      </div>
                      {album.description && (
                        <p className="mt-1 text-sm text-gray-600">{album.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setSelectedAlbumId(album.id);
                          try {
                            await loadItems(album.id);
                          } catch (err) {
                            setMessage({ type: 'error', text: err.message });
                          }
                        }}
                        className={
                          String(selectedAlbumId) === String(album.id)
                            ? `${btnPrimary} py-2`
                            : `${btnSecondary} py-2`
                        }
                      >
                        Load photos
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAlbumId(album.id);
                          setEditAlbumData({
                            name: album.name,
                            description: album.description || '',
                            sortOrder: album.sort_order || album.sortOrder || 0,
                            isPublished:
                              album.is_published ?? album.isPublished ?? true,
                          });
                        }}
                        className={`${btnSecondary} py-2`}
                      >
                        Edit
                      </button>
                      {!isSiteImagesAlbum(album) && (
                        <button
                          type="button"
                          onClick={() => deleteAlbum(album.id, album.name)}
                          className={`${btnDanger} py-2`}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {albums.length === 0 && (
            <p className="rounded-lg bg-gray-50 py-8 text-center text-sm text-gray-600">
              No albums yet. Create one in this section, then scroll down to upload photos.
            </p>
          )}
        </section>

        {/* Upload photos */}
        <section className="mb-10 rounded-2xl border border-white/15 bg-white/[0.97] p-6 shadow-xl backdrop-blur md:p-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-rsa-navy">
                Upload photos
              </h2>
              <p className="mt-1 max-w-xl text-sm text-gray-600">
                Choose an album in this form — files are added there. New uploads start as{' '}
                <strong>unpublished</strong>; turn on Published on each photo when ready.
              </p>
            </div>
          </div>

          <form onSubmit={onUpload} className="space-y-4">
            <div>
              <label htmlFor="upload-album" className="mb-1 block text-sm font-medium text-gray-700">
                Add files to album
              </label>
              <select
                id="upload-album"
                value={selectedAlbumId}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedAlbumId(v);
                  loadItems(v);
                }}
                className={`${inputClass} max-w-md bg-white font-medium`}
              >
                <option value="all">Not in an album (unsorted)</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (!e.currentTarget.contains(e.relatedTarget)) setDragActive(false);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                addFilesFromList(e.dataTransfer.files);
              }}
              className={`rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
                dragActive
                  ? 'border-rsa-gold bg-rsa-gold/10'
                  : 'border-gray-300 bg-gray-50/80 hover:border-rsa-gold/50'
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                id="admin-file-input"
                className="sr-only"
                onChange={(e) => addFilesFromList(e.target.files)}
              />
              <label
                htmlFor="admin-file-input"
                className="cursor-pointer text-sm text-gray-700"
              >
                <span className="font-semibold text-rsa-navy">Choose files</span>
                <span className="text-gray-500"> or drag images here</span>
              </label>
              <p className="mt-2 text-xs text-gray-500">
                JPEG, PNG, WebP · max 10 MB each · up to 20 at once
              </p>
              {files.length > 0 && (
                <p className="mt-4 text-sm font-medium text-rsa-navy">
                  {files.length} file(s) ready — click Upload
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={uploading || files.length === 0} className={btnGold}>
                {uploading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-rsa-navy border-t-transparent" />
                    Uploading…
                  </>
                ) : (
                  <>Upload {files.length > 0 ? `(${files.length})` : ''}</>
                )}
              </button>
              {files.length > 0 && (
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => {
                    setFiles([]);
                    const el = document.getElementById('admin-file-input');
                    if (el) el.value = '';
                  }}
                >
                  Clear selection
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Photo editor list */}
        <section className="rounded-2xl border border-white/15 bg-white/[0.97] p-6 shadow-xl backdrop-blur md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-rsa-navy">
                Edit photos
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Change title, caption, sort order, album, and visibility — then Save each row.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {items.map((item) => (
              <article
                key={rowKey(item)}
                className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 shadow-sm md:p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row">
                  <a
                    href={item.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 self-start overflow-hidden rounded-lg ring-1 ring-gray-200 transition hover:ring-rsa-gold"
                  >
                    <img
                      src={item.publicUrl}
                      alt={item.title || 'Gallery thumbnail'}
                      className="h-40 w-full max-w-[200px] object-cover sm:h-44"
                    />
                  </a>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Title
                        </label>
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) =>
                            updateLocal(item.id, { title: e.target.value })
                          }
                          className={inputClass}
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Sort order
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.sortOrder ?? 0}
                          onChange={(e) =>
                            updateLocal(item.id, {
                              sortOrder: Number(e.target.value) || 0,
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Caption
                      </label>
                      <textarea
                        value={item.caption || ''}
                        onChange={(e) =>
                          updateLocal(item.id, { caption: e.target.value })
                        }
                        rows={2}
                        className={inputClass}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-800">
                        <input
                          type="checkbox"
                          checked={item.isPublished ?? false}
                          onChange={(e) =>
                            updateLocal(item.id, {
                              isPublished: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded text-rsa-navy focus:ring-rsa-gold"
                        />
                        Published (live on site)
                      </label>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Album
                        </label>
                        <select
                          value={item.albumId || ''}
                          onChange={(e) =>
                            updateLocal(item.id, {
                              albumId: e.target.value || null,
                            })
                          }
                          className={inputClass}
                        >
                          <option value="">No album</option>
                          {albums.map((album) => (
                            <option key={album.id} value={album.id}>
                              {album.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-3">
                      <button
                        type="button"
                        onClick={() => saveRow(item)}
                        className={btnGold}
                      >
                        Save changes
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRow(item.id)}
                        className={btnDanger}
                      >
                        Delete photo
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {items.length === 0 && (
            <p className="py-12 text-center text-sm text-gray-600">
              {albums.length === 0
                ? 'Create an album first, then upload photos.'
                : 'No photos in this view. Upload in the section above or pick another album.'}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
