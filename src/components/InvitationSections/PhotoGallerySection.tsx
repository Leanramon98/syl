import React from 'react';
import type { PhotoItem } from '../../config/invitation';

interface PhotoGallerySectionProps {
  photos: PhotoItem[];
}

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({ photos }) => {
  if (!photos || photos.length === 0) return null;

  return (
    <section className="w-full max-w-xl mx-auto mb-10">
      <div className="text-center mb-6">
        <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#8C7A4E] font-medium block mb-1">
          Nuestros Momentos
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2C1D18] font-normal tracking-tight">
          Galería de Fotos
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E8E2D5] bg-[#FAF8F5] shadow-xs aspect-4/5"
          >
            <img
              src={photo.url}
              alt={photo.alt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 pt-6 text-white text-center">
                <p className="font-serif text-xs sm:text-sm italic drop-shadow-xs">
                  {photo.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
