import React from 'react';
import { Heart, GlassWater, Utensils, Music, Sparkles, Moon, Camera } from 'lucide-react';
import type { ItineraryItem } from '../../config/invitation';

interface ItinerarySectionProps {
  items: ItineraryItem[];
}

const renderIcon = (name: ItineraryItem['iconName']) => {
  const iconProps = { className: 'w-4 h-4 stroke-[1.75]' };
  switch (name) {
    case 'heart':
      return <Heart {...iconProps} />;
    case 'glass':
      return <GlassWater {...iconProps} />;
    case 'utensils':
      return <Utensils {...iconProps} />;
    case 'music':
      return <Music {...iconProps} />;
    case 'sparkles':
      return <Sparkles {...iconProps} />;
    case 'moon':
      return <Moon {...iconProps} />;
    case 'camera':
      return <Camera {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
};

export const ItinerarySection: React.FC<ItinerarySectionProps> = ({ items }) => {
  return (
    <section className="w-full max-w-xl mx-auto mb-10">
      <div className="text-center mb-6">
        <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#8C7A4E] font-medium block mb-1">
          Cronograma
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2C1D18] font-normal tracking-tight">
          Itinerario del Día
        </h2>
      </div>

      <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm">
        <div className="relative border-l border-[#E5DFD4] ml-4 sm:ml-6 space-y-6 sm:space-y-8 pl-6 sm:pl-8 py-2">
          {items.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Dot Icon on the line */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF6EE] border border-[#D5C6A9] text-[#8C7A4E] flex items-center justify-center shadow-xs">
                {renderIcon(item.iconName)}
              </div>

              <div>
                <span className="font-serif text-base sm:text-lg font-semibold text-[#8C7A4E]">
                  {item.time}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-[#2C1D18] font-normal mt-0.5">
                  {item.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#736B63] mt-1 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
