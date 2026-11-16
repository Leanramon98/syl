import React from 'react';
import { Music2, ExternalLink } from 'lucide-react';
import type { PlaylistConfig } from '../../config/invitation';

interface PlaylistSectionProps {
  playlist: PlaylistConfig;
}

export const PlaylistSection: React.FC<PlaylistSectionProps> = ({ playlist }) => {
  return (
    <section className="w-full max-w-xl mx-auto mb-10">
      <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-[#FAF6EE] text-[#8C7A4E] flex items-center justify-center mx-auto mb-3 border border-[#EADFC7]">
          <Music2 className="w-6 h-6 stroke-[1.5]" />
        </div>

        <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#8C7A4E] font-medium block mb-1">
          {playlist.subtitle}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2C1D18] font-normal tracking-tight mb-3">
          {playlist.title}
        </h2>

        <p className="font-sans text-xs sm:text-sm text-[#5D4037] max-w-md mx-auto leading-relaxed font-light mb-6">
          {playlist.message}
        </p>

        <a
          href={playlist.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#1DB954] hover:bg-[#1AA34A] text-white text-xs font-sans font-medium uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          <span>Sugerir temas en Spotify</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
};
