import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react';

export interface GalleryPhoto {
  src: string;
  alt: string;
}

interface EditorialGalleryProps {
  photos: GalleryPhoto[];
}

export const EditorialGallery: React.FC<EditorialGalleryProps> = ({ photos }) => {
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const closeGrid = useCallback(() => setIsGridOpen(false), []);

  const showPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev - 1 + photos.length) % photos.length;
    });
  }, [photos.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev + 1) % photos.length;
    });
  }, [photos.length]);

  // Lock body scroll when either modal or lightbox is open
  useEffect(() => {
    if (isGridOpen || lightboxIndex !== null) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isGridOpen, lightboxIndex]);

  // Keyboard navigation for lightbox & grid modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
      } else if (isGridOpen && e.key === 'Escape') {
        closeGrid();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, isGridOpen, closeLightbox, closeGrid, showPrev, showNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) showNext();
      else showPrev();
    }
    touchStartX.current = null;
  };

  const getBentoTileClass = (index: number): string => {
    const slot = index % 7;
    switch (slot) {
      case 0:
        return 'bento-tile bento-half-short';
      case 1:
        return 'bento-tile bento-half-tall';
      case 2:
        return 'bento-tile bento-half-short';
      case 3:
        return 'bento-tile bento-third';
      case 4:
        return 'bento-tile bento-two-thirds';
      case 5:
        return 'bento-tile bento-two-thirds';
      case 6:
      default:
        return 'bento-tile bento-third';
    }
  };

  return (
    <>
      {/* Horizontal Carousel */}
      <div className="carousel reveal d2">
        {photos.map((photo, idx) => (
          <button
            key={`${photo.src}-${idx}`}
            type="button"
            className="slide slide-btn"
            onClick={() => setLightboxIndex(idx)}
            aria-label={`Ver foto ${idx + 1} de ${photos.length}`}
          >
            <img src={photo.src} alt={photo.alt} loading="lazy" />
          </button>
        ))}
      </div>

      <p className="cue reveal d3">Deslizá para ver más</p>

      {/* "Ver todas" Button */}
      <div className="reveal d3" style={{ marginTop: 18 }}>
        <button
          type="button"
          className="btn ghost"
          onClick={() => setIsGridOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Grid className="w-4 h-4" />
          <span>Ver todas ({photos.length})</span>
        </button>
      </div>

      {/* Airbnb-style Asymmetric Grid Modal */}
      {isGridOpen && (
        <div
          className="fixed inset-0 z-[100] bg-[#F9F0EA] flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Galería completa de fotos"
        >
          {/* Sticky Top Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#b4717a]/25 bg-[#F9F0EA]/95 backdrop-blur-md shrink-0">
            <div className="text-left">
              <p className="font-['Instrument_Serif',serif] text-2xl text-[#53111B] leading-none">
                Sol &amp; Lea
              </p>
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] tracking-[0.18em] uppercase text-[#9A7B6A] mt-1">
                {photos.length} fotos
              </p>
            </div>
            <button
              type="button"
              onClick={closeGrid}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 border border-[#b4717a]/40 text-[#53111B] text-xs font-['Plus_Jakarta_Sans',sans-serif] font-medium hover:bg-white transition-colors cursor-pointer"
              aria-label="Cerrar galería"
            >
              <X className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
          </div>

          {/* Scrollable Asymmetric Bento Grid */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5">
            <div className="bento-grid max-w-3xl mx-auto">
              {photos.map((photo, idx) => (
                <button
                  key={`grid-${photo.src}-${idx}`}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={getBentoTileClass(idx)}
                  aria-label={`Abrir foto ${idx + 1}`}
                >
                  <img src={photo.src} alt={photo.alt} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Photo Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[120] bg-[#140A0C]/95 backdrop-blur-md flex flex-col items-center justify-center select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Visor de foto"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar */}
          <div
            className="absolute top-0 inset-x-0 flex items-center justify-between px-4 sm:px-6 py-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-xs tracking-[0.2em] text-[#F9F0EA]/80">
              {lightboxIndex + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-[#F9F0EA] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar visor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prev Button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-[#F9F0EA] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Active Image */}
          <div
            className="px-4 sm:px-16 py-16 flex items-center justify-center max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].src}
              alt={photos[lightboxIndex].alt}
              className="max-h-[82dvh] max-w-[92vw] sm:max-w-[82vw] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Next Button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-[#F9F0EA] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
};
