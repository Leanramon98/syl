import React from 'react';
import { Sparkles } from 'lucide-react';
import type { DressCodeConfig } from '../../config/invitation';

interface DressCodeSectionProps {
  dressCode: DressCodeConfig;
}

export const DressCodeSection: React.FC<DressCodeSectionProps> = ({ dressCode }) => {
  return (
    <section className="w-full max-w-xl mx-auto mb-10">
      <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-[#FAF6EE] text-[#8C7A4E] flex items-center justify-center mx-auto mb-3 border border-[#EADFC7]">
          <Sparkles className="w-6 h-6 stroke-[1.5]" />
        </div>

        <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#8C7A4E] font-medium block mb-1">
          {dressCode.title}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2C1D18] font-normal tracking-tight mb-3">
          {dressCode.subtitle}
        </h2>

        <p className="font-sans text-xs sm:text-sm text-[#5D4037] max-w-md mx-auto leading-relaxed font-light mb-4">
          {dressCode.description}
        </p>

        {dressCode.colorPalette && dressCode.colorPalette.length > 0 && (
          <div className="mb-4">
            <span className="font-sans text-[11px] uppercase tracking-wider text-[#8C847E] block mb-2">
              Paleta sugerida
            </span>
            <div className="flex items-center justify-center gap-2">
              {dressCode.colorPalette.map((color, idx) => (
                <div
                  key={idx}
                  style={{ backgroundColor: color }}
                  className="w-6 h-6 rounded-full border border-black/10 shadow-2xs"
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {dressCode.avoidColorsNote && (
          <div className="inline-block px-4 py-2 rounded-full bg-[#FAF6EE] border border-[#EADFC7] text-xs font-serif italic text-[#8C7A4E]">
            {dressCode.avoidColorsNote}
          </div>
        )}
      </div>
    </section>
  );
};
