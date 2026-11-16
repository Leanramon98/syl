import React from 'react';
import { MapPin, Church, GlassWater } from 'lucide-react';
import type { VenueConfig } from '../../config/invitation';

interface VenueSectionProps {
  venue: VenueConfig;
}

export const VenueSection: React.FC<VenueSectionProps> = ({ venue }) => {
  return (
    <section className="w-full max-w-xl mx-auto mb-10">
      <div className="text-center mb-6">
        <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#8C7A4E] font-medium block mb-1">
          Dónde & Cuándo
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2C1D18] font-normal tracking-tight">
          Ceremonia & Fiesta
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ceremonia */}
        <div className="bg-white/95 rounded-3xl p-6 border border-[#E8E2D5] shadow-sm flex flex-col justify-between text-center">
          <div>
            <div className="w-12 h-12 rounded-full bg-[#FAF6EE] text-[#8C7A4E] flex items-center justify-center mx-auto mb-3 border border-[#EADFC7]">
              <Church className="w-6 h-6 stroke-[1.5]" />
            </div>
            <span className="font-sans text-[11px] uppercase tracking-widest text-[#8C7A4E] font-medium block">
              {venue.ceremony.title}
            </span>
            <h3 className="font-serif text-2xl text-[#2C1D18] font-normal mt-1 mb-1">
              {venue.ceremony.name}
            </h3>
            <p className="font-serif text-lg font-medium text-[#8C7A4E] mb-2">
              {venue.ceremony.time}
            </p>
            <p className="font-sans text-xs text-[#5D4037] leading-relaxed">
              {venue.ceremony.address}
              <br />
              <span className="text-[#8C847E]">{venue.ceremony.city}</span>
            </p>
            {venue.ceremony.note && (
              <p className="font-serif italic text-xs text-[#8C847E] mt-3">
                {venue.ceremony.note}
              </p>
            )}
          </div>

          <div className="pt-5 mt-auto">
            <a
              href={venue.ceremony.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full border border-[#2C2A29] text-[#2C2A29] hover:bg-[#2C2A29] hover:text-white text-xs font-sans uppercase tracking-widest transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Cómo llegar</span>
            </a>
          </div>
        </div>

        {/* Fiesta */}
        <div className="bg-white/95 rounded-3xl p-6 border border-[#E8E2D5] shadow-sm flex flex-col justify-between text-center">
          <div>
            <div className="w-12 h-12 rounded-full bg-[#FAF6EE] text-[#8C7A4E] flex items-center justify-center mx-auto mb-3 border border-[#EADFC7]">
              <GlassWater className="w-6 h-6 stroke-[1.5]" />
            </div>
            <span className="font-sans text-[11px] uppercase tracking-widest text-[#8C7A4E] font-medium block">
              {venue.party.title}
            </span>
            <h3 className="font-serif text-2xl text-[#2C1D18] font-normal mt-1 mb-1">
              {venue.party.name}
            </h3>
            <p className="font-serif text-lg font-medium text-[#8C7A4E] mb-2">
              {venue.party.time}
            </p>
            <p className="font-sans text-xs text-[#5D4037] leading-relaxed">
              {venue.party.address}
              <br />
              <span className="text-[#8C847E]">{venue.party.city}</span>
            </p>
            {venue.party.note && (
              <p className="font-serif italic text-xs text-[#8C847E] mt-3">
                {venue.party.note}
              </p>
            )}
          </div>

          <div className="pt-5 mt-auto">
            <a
              href={venue.party.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full border border-[#2C2A29] text-[#2C2A29] hover:bg-[#2C2A29] hover:text-white text-xs font-sans uppercase tracking-widest transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Cómo llegar</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
