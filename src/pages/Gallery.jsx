import { useCallback, useEffect, useState } from 'react';
import { apiUrl } from '../apiBase';

function pickRandomItem(items) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  /** Random published photo per album id (from `/api/gallery` grouped by albumId) */
  const [albumCovers, setAlbumCovers] = useState({});
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /** Index into `photos` while lightbox open; null = closed */
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [albumsRes, galleryRes] = await Promise.all([
          fetch(apiUrl('/api/albums')),
          fetch(apiUrl('/api/gallery')),
        ]);
        if (!albumsRes.ok) throw new Error('Could not load albums');
        const albumsData = await albumsRes.json();
        if (cancelled) return;

        const albumList = albumsData.albums || [];
        setAlbums(albumList);

        if (galleryRes.ok) {
          const galleryData = await galleryRes.json();
          const items = galleryData.items || [];
          if (!cancelled && albumList.length > 0 && items.length > 0) {
            const covers = {};
            for (const album of albumList) {
              const aid = String(album.id);
              const inAlbum = items.filter((it) => it.albumId != null && String(it.albumId) === aid);
              const pick = pickRandomItem(inAlbum);
              if (pick) covers[aid] = pick;
            }
            setAlbumCovers(covers);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load gallery');
      } finally {
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
    setLightboxIndex(null);
    setSelectedAlbum(null);
    setPhotos([]);
  };

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goLightboxPrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null || i <= 0) return i;
      return i - 1;
    });
  }, []);

  const goLightboxNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null || photos.length === 0) return i;
      if (i >= photos.length - 1) return i;
      return i + 1;
    });
  }, [photos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goLightboxPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goLightboxNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, closeLightbox, goLightboxPrev, goLightboxNext]);

  const LIGHTBOX_AUTO_MS = 7000;
  useEffect(() => {
    if (lightboxIndex === null || photos.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setLightboxIndex((i) => {
        if (i === null || photos.length === 0) return i;
        if (i >= photos.length - 1) return 0;
        return i + 1;
      });
    }, LIGHTBOX_AUTO_MS);
    return () => window.clearInterval(id);
  }, [lightboxIndex, photos.length]);

  const lightboxItem =
    lightboxIndex !== null && photos[lightboxIndex] ? photos[lightboxIndex] : null;
  const lightboxPrevDisabled = lightboxIndex === null || lightboxIndex <= 0;
  const lightboxNextDisabled =
    lightboxIndex === null ||
    photos.length === 0 ||
    lightboxIndex >= photos.length - 1;

  return (
    <div className="bg-gradient-to-b from-rsa-navy via-slate-900 to-rsa-navy min-h-screen">
      {/* Subtle pattern overlay (matches Home hero treatment) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.07]">
        <div
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-14 pb-20 md:pt-20 md:pb-24">
        {!selectedAlbum && (
          <header className="text-center mb-14 md:mb-16">
            <div className="inline-block rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 px-6 py-8 md:px-10 md:py-10 shadow-xl max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white mb-4 tracking-tight">
                Gallery
              </h1>
              <div className="h-1 w-16 bg-rsa-gold mx-auto rounded-full mb-6" aria-hidden />
              <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                Photos from Hakaru & Districts RSA. Explore albums below — moments from our community and events.
              </p>
            </div>
          </header>
        )}

        {loading && !selectedAlbum && (
          <p className="text-center text-gray-400 mb-8">Loading albums…</p>
        )}
        {error && (
          <p className="text-center text-amber-200/95 mb-8 px-2">{error}</p>
        )}

        {/* Album Selection View */}
        {!selectedAlbum && (
          <div>
            {!loading && albums.length === 0 && (
              <p className="text-center text-gray-400 bg-white/5 rounded-xl border border-white/10 py-12 px-4">
                No albums published yet. Please visit again soon.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {albums.map((album) => {
                const cover = albumCovers[String(album.id)];
                return (
                  <button
                    key={album.id}
                    type="button"
                    onClick={() => loadAlbumPhotos(album)}
                    className="text-left bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden border-t-[5px] border-rsa-gold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-rsa-gold/50 group flex flex-col"
                  >
                    <div className="relative h-48 md:h-52 shrink-0 bg-slate-200 overflow-hidden">
                      {cover ? (
                        <img
                          src={cover.publicUrl}
                          alt=""
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rsa-navy/90 to-slate-800 text-rsa-gold/40">
                          <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-6 md:p-7 flex flex-col flex-grow">
                      <h2 className="text-xl md:text-2xl font-bold font-heading text-rsa-navy mb-2 group-hover:text-rsa-gold transition-colors">
                        {album.name}
                      </h2>
                      {album.description && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{album.description}</p>
                      )}
                      <p className="text-rsa-gold text-sm font-bold mt-5 inline-flex items-center gap-1">
                        Open album
                        <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Photo View for Selected Album */}
        {selectedAlbum && (
          <div>
            <button
              type="button"
              onClick={goBack}
              className="mb-8 inline-flex items-center gap-2 text-rsa-gold hover:text-yellow-300 transition-colors font-semibold text-sm md:text-base rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-rsa-gold px-2 py-1 -ml-2"
            >
              <span aria-hidden>←</span> Back to albums
            </button>

            <div className="mb-10 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-sm px-6 py-8 md:px-8">
              <h2 className="text-2xl md:text-4xl font-bold font-heading text-white mb-3">
                {selectedAlbum.name}
              </h2>
              {selectedAlbum.description && (
                <p className="text-gray-300 max-w-3xl leading-relaxed">{selectedAlbum.description}</p>
              )}
            </div>

            {loading && (
              <p className="text-center text-gray-400">Loading photos…</p>
            )}

            {!loading && photos.length === 0 && (
              <p className="text-center text-gray-400 bg-white/5 rounded-xl border border-white/10 py-12">
                No photos in this album yet.
              </p>
            )}

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 list-none p-0 m-0">
              {photos.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full text-left bg-white/95 backdrop-blur rounded-2xl shadow-lg overflow-hidden border-t-[5px] border-rsa-gold hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-rsa-gold/50"
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img
                      src={item.publicUrl}
                      alt={item.title || item.caption || 'Gallery photo'}
                      className="w-full h-56 md:h-64 object-cover"
                      loading="lazy"
                    />
                    {(item.title || item.caption) && (
                      <div className="p-4 md:p-5">
                        {item.title && (
                          <h3 className="text-lg font-bold font-heading text-rsa-navy mb-1">
                            {item.title}
                          </h3>
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

      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged photo"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close"
            onClick={closeLightbox}
          />
          <div className="relative flex w-full max-w-5xl max-h-[90vh] flex-col items-center z-10 px-10 sm:px-14 md:px-16">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goLightboxPrev();
              }}
              disabled={lightboxPrevDisabled}
              aria-label="Previous photo"
              className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-rsa-navy/90 p-2.5 text-white shadow-lg transition hover:bg-rsa-navy hover:border-rsa-gold disabled:pointer-events-none disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-rsa-gold"
            >
              <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goLightboxNext();
              }}
              disabled={lightboxNextDisabled}
              aria-label="Next photo"
              className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-rsa-navy/90 p-2.5 text-white shadow-lg transition hover:bg-rsa-navy hover:border-rsa-gold disabled:pointer-events-none disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-rsa-gold"
            >
              <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <img
              src={lightboxItem.publicUrl}
              alt={lightboxItem.title || lightboxItem.caption || 'Gallery photo'}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl ring-1 ring-white/20"
            />
            {(lightboxItem.title || lightboxItem.caption) && (
              <p className="mt-5 text-center text-sm text-white/95 md:text-base max-w-xl leading-relaxed">
                {lightboxItem.title ? (
                  <span className="block font-semibold">{lightboxItem.title}</span>
                ) : null}
                {lightboxItem.caption ? (
                  <span className="block text-white/85">{lightboxItem.caption}</span>
                ) : null}
              </p>
            )}
            <p className="mt-3 text-xs text-white/50">
              {photos.length > 1
                ? `${lightboxIndex + 1} / ${photos.length} · Arrow keys · Auto-advance every 7s`
                : null}
            </p>
            <button
              type="button"
              className="mt-6 rounded-lg bg-rsa-gold px-8 py-2.5 font-bold text-rsa-navy hover:bg-yellow-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-rsa-gold/60"
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
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
