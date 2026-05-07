import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../apiBase';

function rowKey(item) {
  return item.id;
}

export default function AdminGallery() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState('all');
  const [showNewAlbumForm, setShowNewAlbumForm] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ name: '', description: '', sortOrder: 0, isPublished: true });
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [editAlbumData, setEditAlbumData] = useState({});

  const loadAlbums = useCallback(async () => {
    const res = await fetch(apiUrl('/api/admin/albums'), { credentials: 'include' });
    if (res.status === 401) {
      navigate('/admin/login', { replace: true });
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to load albums');
    }
    const data = await res.json();
    setAlbums(data.albums || []);
  }, [navigate]);

  const loadItems = useCallback(async (albumId = null) => {
    const path = albumId && albumId !== 'all'
      ? `/api/admin/gallery/album/${albumId}`
      : '/api/admin/gallery';
    const res = await fetch(apiUrl(path), { credentials: 'include' });
    if (res.status === 401) {
      navigate('/admin/login', { replace: true });
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to load gallery');
    }
    const data = await res.json();
    setItems(data.items || []);
  }, [navigate]);

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

  const logout = async () => {
    await fetch(apiUrl('/api/admin/logout'), {
      method: 'POST',
      credentials: 'include',
    });
    navigate('/admin/login', { replace: true });
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
        headers: { 'Content-Type': 'application/json' },
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
      setMessage({ type: 'ok', text: 'Saved.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm('Delete this photo from the gallery and storage?')) return;
    setMessage(null);
    try {
      const res = await fetch(apiUrl(`/api/admin/gallery/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setItems((prev) => prev.filter((it) => it.id !== id));
      setMessage({ type: 'ok', text: 'Deleted.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const onUpload = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setMessage({ type: 'error', text: 'Choose image files first.' });
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
        credentials: 'include',
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        navigate('/admin/login', { replace: true });
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setFiles([]);
      e.target.reset();
      await load();
      setMessage({ type: 'ok', text: `Uploaded ${data.count || files.length} images to "${albums.find(a => a.id === selectedAlbumId)?.name || 'Gallery'}".` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const createAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbum.name.trim()) {
      setMessage({ type: 'error', text: 'Album name is required' });
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/admin/albums'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newAlbum),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create album');
      setNewAlbum({ name: '', description: '', sortOrder: 0, isPublished: true });
      setShowNewAlbumForm(false);
      await load();
      setMessage({ type: 'ok', text: 'Album created.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const updateAlbum = async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/albums/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    if (!window.confirm(`Delete album "${name}"? Photos in this album will not be deleted but will be unassigned.`)) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/albums/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete album');
      if (selectedAlbumId === id) setSelectedAlbumId('all');
      await load();
      setMessage({ type: 'ok', text: 'Album deleted.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold font-heading text-rsa-navy">Gallery admin</h1>
          <div className="flex gap-3">
            <Link
              to="/gallery"
              className="text-sm text-rsa-navy underline hover:text-rsa-gold"
            >
              View public gallery
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-gray-600 underline hover:text-rsa-navy"
            >
              Sign out
            </button>
            <Link to="/" className="text-sm text-gray-600 underline hover:text-rsa-navy">
              Home
            </Link>
          </div>
        </div>

        {message && (
          <p
            className={`mb-4 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-700'}`}
            role="status"
          >
            {message.text}
          </p>
        )}

        {/* Albums Management */}
        <div className="bg-white rounded-xl shadow p-6 mb-10 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-rsa-navy">Albums</h2>
            <button
              type="button"
              onClick={() => setShowNewAlbumForm(!showNewAlbumForm)}
              className="text-sm bg-rsa-gold text-rsa-navy px-3 py-1.5 rounded-md font-bold hover:bg-yellow-400"
            >
              {showNewAlbumForm ? 'Cancel' : '+ New Album'}
            </button>
          </div>

          {showNewAlbumForm && (
            <form onSubmit={createAlbum} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-rsa-navy mb-3">Create New Album</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Album Name *</label>
                  <input
                    type="text"
                    value={newAlbum.name}
                    onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    placeholder="e.g., ANZAC Day 2026"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    value={newAlbum.sortOrder}
                    onChange={(e) => setNewAlbum({ ...newAlbum, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={newAlbum.description}
                  onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                  rows={2}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                  placeholder="Describe this album..."
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm mb-3">
                <input
                  type="checkbox"
                  checked={newAlbum.isPublished}
                  onChange={(e) => setNewAlbum({ ...newAlbum, isPublished: e.target.checked })}
                />
                Published (visible on public gallery)
              </label>
              <div>
                <button
                  type="submit"
                  className="bg-rsa-navy text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800"
                >
                  Create Album
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {albums.map((album) => (
              <div
                key={album.id}
                className={`border rounded-lg p-3 ${editingAlbumId === album.id ? 'border-rsa-gold bg-yellow-50' : 'border-gray-200'}`}
              >
                {editingAlbumId === album.id ? (
                  <div>
                    <div className="grid sm:grid-cols-2 gap-3 mb-2">
                      <input
                        type="text"
                        value={editAlbumData.name ?? album.name}
                        onChange={(e) => setEditAlbumData({ ...editAlbumData, name: e.target.value })}
                        className="w-full border rounded px-2 py-1.5 text-sm"
                      />
                      <input
                        type="number"
                        min={0}
                        value={editAlbumData.sortOrder ?? album.sortOrder}
                        onChange={(e) => setEditAlbumData({ ...editAlbumData, sortOrder: parseInt(e.target.value) || 0 })}
                        className="w-full border rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <textarea
                      value={editAlbumData.description ?? album.description ?? ''}
                      onChange={(e) => setEditAlbumData({ ...editAlbumData, description: e.target.value })}
                      rows={2}
                      className="w-full border rounded px-2 py-1.5 text-sm mb-2"
                    />
                    <label className="inline-flex items-center gap-2 text-sm mb-2">
                      <input
                        type="checkbox"
                        checked={editAlbumData.isPublished ?? album.is_published ?? album.isPublished ?? false}
                        onChange={(e) => setEditAlbumData({ ...editAlbumData, isPublished: e.target.checked })}
                      />
                      Published
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateAlbum(album.id)}
                        className="bg-rsa-navy text-white text-xs px-3 py-1 rounded hover:bg-slate-800"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAlbumId(null)}
                        className="text-xs text-gray-600 underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-rsa-navy">{album.name}</h3>
                        {!album.isPublished && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Draft</span>
                        )}
                      </div>
                      {album.description && (
                        <p className="text-sm text-gray-600 mt-1">{album.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setSelectedAlbumId(album.id);
                          try {
                            await loadItems(album.id);
                          } catch (e) {
                            setMessage({ type: 'error', text: e.message });
                          }
                        }}
                        className={`text-xs px-3 py-1 rounded ${selectedAlbumId === album.id ? 'bg-rsa-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        View Photos
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAlbumId(album.id);
                          setEditAlbumData({
                            name: album.name,
                            description: album.description || '',
                            sortOrder: album.sort_order || album.sortOrder || 0,
                            isPublished: album.is_published ?? album.isPublished ?? true,
                          });
                        }}
                        className="text-xs text-rsa-navy underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAlbum(album.id, album.name)}
                        className="text-xs text-red-600 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {albums.length === 0 && (
              <p className="text-gray-600 text-sm">No albums yet. Create your first album above.</p>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <form
          onSubmit={onUpload}
          className="bg-white rounded-xl shadow p-6 mb-10 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-rsa-navy mb-3">Upload photos</h2>
          <p className="text-sm text-gray-600 mb-3">
            JPEG, PNG, or WebP. Max 10 MB. New uploads are unpublished until you enable &quot;Published&quot;.
          </p>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Upload to album:</label>
            <select
              value={selectedAlbumId}
              onChange={(e) => {
                setSelectedAlbumId(e.target.value);
                loadItems(e.target.value);
              }}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="all">All Photos (no specific album)</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>{album.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            <button
              type="submit"
              disabled={uploading || files.length === 0}
              className="bg-rsa-gold text-rsa-navy px-4 py-2 rounded-md font-bold hover:bg-yellow-400 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : `Upload ${files.length > 0 ? `(${files.length})` : ''}`}
            </button>
          </div>
          {files.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">{files.length} file(s) selected</p>
          )}
        </form>

        {/* Gallery Items */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-rsa-navy">
            {selectedAlbumId === 'all' ? 'All Photos' : albums.find(a => a.id === selectedAlbumId)?.name || 'Photos'}
          </h2>
          <p className="text-sm text-gray-600">{items.length} photo(s)</p>
        </div>

        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={rowKey(item)}
              className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col md:flex-row gap-4"
            >
              <img
                src={item.publicUrl}
                alt={item.title || ''}
                className="w-full md:w-40 h-40 object-cover rounded-md shrink-0"
              />
              <div className="flex-grow space-y-2 min-w-0">
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Title</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateLocal(item.id, { title: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Sort order</label>
                    <input
                      type="number"
                      min={0}
                      value={item.sortOrder ?? 0}
                      onChange={(e) =>
                        updateLocal(item.id, { sortOrder: Number(e.target.value) || 0 })
                      }
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Caption</label>
                  <textarea
                    value={item.caption || ''}
                    onChange={(e) => updateLocal(item.id, { caption: e.target.value })}
                    rows={2}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.isPublished ?? false}
                      onChange={(e) => updateLocal(item.id, { isPublished: e.target.checked })}
                    />
                    Published
                  </label>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Move to album:</label>
                    <select
                      value={item.albumId || ''}
                      onChange={(e) => updateLocal(item.id, { albumId: e.target.value || null })}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">No album</option>
                      {albums.map((album) => (
                        <option key={album.id} value={album.id}>{album.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => saveRow(item)}
                    className="bg-rsa-navy text-white text-sm px-3 py-1.5 rounded-md hover:bg-slate-800"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRow(item.id)}
                    className="text-sm text-red-600 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <p className="text-gray-600 text-center mt-8">
            {albums.length === 0
              ? 'Create an album first, then upload photos.'
              : 'No photos yet. Upload photos to this album above.'}
          </p>
        )}
      </div>
    </div>
  );
}
