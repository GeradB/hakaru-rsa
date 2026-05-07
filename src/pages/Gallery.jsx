import { useEffect, useState } from 'react';
import { apiUrl } from '../apiBase';

export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [lightboxCaption, setLightboxCaption] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Load albums
        const albumsRes = await fetch(apiUrl('/api/albums'));
        if (!albumsRes.ok) throw new Error('Could not load albums');
        const albumsData = await albumsRes.json();
        if (cancelled) return;

        const albumList = albumsData.albums || [];
        setAlbums(albumList);
        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load gallery');
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadAlbumPhotos = async (album) => {
    setLoading(true);
    try {
      const photosRes = await fetch(apiUrl(`/api/gallery/${album.id}`));
      if (!photosRes.ok) throw new Error('Could not load photos');
      const photosData = await photosRes.json();
      setPhotos(photosData.items || []);
      setSelectedAlbum(album);
    } catch (e) {
      setError(e.message || 'Could not load photos');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setSelectedAlbum(null);
    setPhotos([]);
  };

  return (
    <div className="bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-white text-center mb-4">
          Gallery
        </h1>
        <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Photos from Hakaru & Districts RSA. Check back as we add more moments from our community.
        </p>

        {loading && !selectedAlbum && (
          <p className="text-center text-gray-400">Loading albums…</p>
        )}
        {error && (
          <p className="text-center text-amber-200">{error}</p>
        )}

        {/* Album Selection View */}
        {!selectedAlbum && (
          <div>
            {!loading && albums.length === 0 && (
              <p className="text-center text-gray-400">
                No albums published yet. Please visit again soon.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <button
                  key={album.id}
                  type="button"
                  onClick={() => loadAlbumPhotos(album)}
                  className="text-left bg-white/95 backdrop-blur rounded-xl shadow-xl overflow-hidden border-t-4 border-rsa-gold hover:shadow-2xl transition-all focus:outline-none focus:ring-4 focus:ring-rsa-gold/50 group"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-bold font-heading text-rsa-navy mb-2 group-hover:text-rsa-gold transition-colors">
                      {album.name}
                    </h2>
                    {album.description && (
                      <p className="text-gray-600 text-sm line-clamp-3">{album.description}</p>
                    )}
                    <p className="text-rsa-gold text-sm font-semibold mt-4">
                      View Photos →
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photo View for Selected Album */}
        {selectedAlbum && (
          <div>
            <button
              type="button"
              onClick={goBack}
              className="mb-6 flex items-center gap-2 text-rsa-gold hover:text-yellow-400 transition-colors"
            >
              ← Back to Albums
            </button>

            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mb-2">
                {selectedAlbum.name}
              </h2>
              {selectedAlbum.description && (
                <p className="text-gray-300 max-w-3xl">{selectedAlbum.description}</p>
              )}
            </div>

            {loading && (
              <p className="text-center text-gray-400">Loading photos…</p>
            )}

            {!loading && photos.length === 0 && (
              <p className="text-center text-gray-400">
                No photos in this album yet.
              </p>
            )}

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
              {photos.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full text-left bg-white/95 backdrop-blur rounded-xl shadow-xl overflow-hidden border-t-4 border-rsa-gold hover:shadow-2xl transition-all focus:outline-none focus:ring-4 focus:ring-rsa-gold/50"
                    onClick={() => {
                      setLightboxUrl(item.publicUrl);
                      setLightboxCaption(item.caption || item.title || '');
                    }}
                  >
                    <img
                      src={item.publicUrl}
                      alt={item.title || item.caption || 'Gallery photo'}
                      className="w-full h-56 object-cover"
                      loading="lazy"
                    />
                    {(item.title || item.caption) && (
                      <div className="p-4">
                        {item.title && (
                          <h2 className="text-lg font-bold font-heading text-rsa-navy mb-1">
                            {item.title}
                          </h2>
                        )}
                        {item.caption && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged photo"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close"
            onClick={() => {
              setLightboxUrl(null);
              setLightboxCaption('');
            }}
          />
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center z-10">
            <img
              src={lightboxUrl}
              alt=""
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
            />
            {lightboxCaption && (
              <p className="mt-4 text-white text-center text-sm max-w-xl">{lightboxCaption}</p>
            )}
            <button
              type="button"
              className="mt-6 bg-rsa-gold text-rsa-navy px-6 py-2 rounded-md font-bold hover:bg-yellow-400 focus:ring-4 focus:ring-rsa-gold/50"
              onClick={() => {
                setLightboxUrl(null);
                setLightboxCaption('');
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
