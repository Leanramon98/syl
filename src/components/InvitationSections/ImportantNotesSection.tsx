import React from 'react';
import { ShieldCheck, Clock, Car, Smile } from 'lucide-react';
import type { TipItem } from '../../config/invitation';

interface ImportantNotesSectionProps {
  tips: TipItem[];
}

const renderTipIcon = (name: TipItem['iconName']) => {
  const iconProps = { className: 'w-5 h-5 stroke-[1.5]' };
  switch (name) {
    case 'clock':
      return <Clock {...iconProps} />;
    case 'car':
      return <Car {...iconProps} />;
    case 'shield':
      return <ShieldCheck {...iconProps} />;
    case 'smile':
      return <Smile {...iconProps} />;
    default:
      return <Smile {...iconProps} />;
  }
};

export const ImportantNotesSection: React.FC<ImportantNotesSectionProps> = ({ tips }) => {
  if (!tips || tips.length === 0) return null;

  return (
    <section className="w-full max-w-xl mx-auto mb-10">
      <div className="text-center mb-6">
        <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#8C7A4E] font-medium block mb-1">
          Información
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2C1D18] font-normal tracking-tight">
          Tips & Notas Útiles
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className="bg-white/95 rounded-2xl p-5 border border-[#E8E2D5] shadow-xs text-center flex flex-col items-center"
          >
            <div className="w-10 h-10 rounded-full bg-[#FAF6EE] text-[#8C7A4E] flex items-center justify-center mb-2.5 border border-[#EADFC7]">
              {renderTipIcon(tip.iconName)}
            </div>
            <h3 className="font-serif text-lg text-[#2C1D18] font-medium mb-1">
              {tip.title}
            </h3>
            <p className="font-sans text-xs text-[#736B63] leading-relaxed font-light">
              {tip.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
