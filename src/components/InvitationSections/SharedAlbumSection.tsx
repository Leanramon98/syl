import React from 'react';
import { Camera, Upload, Hash } from 'lucide-react';
import type { SharedAlbumConfig } from '../../config/invitation';

interface SharedAlbumSectionProps {
  sharedAlbum: SharedAlbumConfig;
}

export const SharedAlbumSection: React.FC<SharedAlbumSectionProps> = ({ sharedAlbum }) => {
  return (
    <section className="w-full max-w-xl mx-auto mb-10">
      <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-[#FAF6EE] text-[#8C7A4E] flex items-center justify-center mx-auto mb-3 border border-[#EADFC7]">
          <Camera className="w-6 h-6 stroke-[1.5]" />
        </div>

        <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#8C7A4E] font-medium block mb-1">
          {sharedAlbum.subtitle}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2C1D18] font-normal tracking-tight mb-3">
          {sharedAlbum.title}
        </h2>

        <p className="font-sans text-xs sm:text-sm text-[#5D4037] max-w-md mx-auto leading-relaxed font-light mb-4">
          {sharedAlbum.description}
        </p>

        {sharedAlbum.hashtag && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF6EE] text-[#8C7A4E] text-xs font-mono font-semibold mb-6 border border-[#EADFC7]">
            <Hash className="w-3.5 h-3.5" />
            <span>{sharedAlbum.hashtag.replace(/^#/, '')}</span>
          </div>
        )}

        <div>
          <a
            href={sharedAlbum.uploadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#2C2A29] hover:bg-[#444] text-white text-xs font-sans font-medium uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span>Subir fotos al álbum</span>
          </a>
        </div>
      </div>
    </section>
  );
};
