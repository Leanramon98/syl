import React, { useState } from 'react';
import { Gift, Copy, Check } from 'lucide-react';
import type { GiftsConfig } from '../../config/invitation';

interface GiftsSectionProps {
  gifts: GiftsConfig;
}

export const GiftsSection: React.FC<GiftsSectionProps> = ({ gifts }) => {
  const [copiedField, setCopiedField] = useState<'alias' | 'cbu' | null>(null);

  const handleCopy = (text: string, field: 'alias' | 'cbu') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2200);
  };

  return (
    <section className="w-full max-w-xl mx-auto mb-10">
      <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-[#FAF6EE] text-[#8C7A4E] flex items-center justify-center mx-auto mb-3 border border-[#EADFC7]">
          <Gift className="w-6 h-6 stroke-[1.5]" />
        </div>

        <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#8C7A4E] font-medium block mb-1">
          Presentes
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2C1D18] font-normal tracking-tight mb-3">
          {gifts.title}
        </h2>

        <p className="font-sans text-xs sm:text-sm text-[#5D4037] max-w-md mx-auto leading-relaxed font-light mb-6">
          {gifts.message}
        </p>

        {/* Bank details card */}
        <div className="p-5 rounded-2xl bg-[#FCFAF6] border border-[#E8E2D5] text-left max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFE9DE] pb-2 text-xs">
            <span className="text-[#8C847E] font-sans">Banco</span>
            <span className="font-serif text-sm font-semibold text-[#2C1D18]">
              {gifts.bankDetails.bank} ({gifts.bankDetails.accountType})
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#EFE9DE] pb-2 text-xs">
            <span className="text-[#8C847E] font-sans">Titular</span>
            <span className="font-serif text-sm font-semibold text-[#2C1D18]">
              {gifts.bankDetails.titular}
            </span>
          </div>

          {/* Alias */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div>
              <span className="font-sans text-[11px] text-[#8C847E] block uppercase tracking-wider">
                Alias
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#8C7A4E]">
                {gifts.bankDetails.alias}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(gifts.bankDetails.alias, 'alias')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#8C7A4E] text-[#8C7A4E] hover:bg-[#8C7A4E] hover:text-white text-xs font-sans font-medium transition-all cursor-pointer shadow-2xs"
            >
              {copiedField === 'alias' ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Alias</span>
                </>
              )}
            </button>
          </div>

          {/* CBU */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="min-w-0">
              <span className="font-sans text-[11px] text-[#8C847E] block uppercase tracking-wider">
                CBU
              </span>
              <span className="font-mono text-xs sm:text-sm font-medium text-[#2C1D18] truncate block">
                {gifts.bankDetails.cbu}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(gifts.bankDetails.cbu, 'cbu')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DCD5C7] text-[#5C544E] hover:border-[#2C2A29] hover:text-[#2C2A29] text-xs font-sans font-medium transition-all cursor-pointer shrink-0"
            >
              {copiedField === 'cbu' ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar CBU</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
