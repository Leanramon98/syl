import React from 'react';
import { BedDouble, MessageCircle, ExternalLink } from 'lucide-react';
import type { LodgingItem } from '../../config/invitation';

interface LodgingSectionProps {
  lodging: LodgingItem[];
}

export const LodgingSection: React.FC<LodgingSectionProps> = ({ lodging }) => {
  if (!lodging || lodging.length === 0) return null;

  return (
    <section className="w-full max-w-xl mx-auto mb-10">
      <div className="text-center mb-6">
        <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#8C7A4E] font-medium block mb-1">
          Para los que viajan
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2C1D18] font-normal tracking-tight">
          Hospedaje Sugerido
        </h2>
      </div>

      <div className="space-y-4">
        {lodging.map((item, idx) => (
          <div
            key={idx}
            className="bg-white/95 rounded-3xl p-5 sm:p-6 border border-[#E8E2D5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF6EE] text-[#8C7A4E] text-[11px] font-sans font-medium mb-1.5 border border-[#EADFC7]">
                <BedDouble className="w-3.5 h-3.5" />
                <span>{item.distance}</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C1D18] font-normal">
                {item.name}
              </h3>
              <p className="font-sans text-xs text-[#736B63] mt-1 leading-relaxed max-w-md">
                {item.description}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
              {item.whatsapp && (
                <a
                  href={`https://wa.me/${item.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#25D366] hover:bg-[#20BE5A] text-white text-xs font-sans font-medium transition-all cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}

              {item.websiteUrl && (
                <a
                  href={item.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#DCD5C7] hover:border-[#2C2A29] text-[#2C2A29] text-xs font-sans font-medium transition-all cursor-pointer"
                >
                  <span>Ver web</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
