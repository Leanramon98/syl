import React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Calendar, MapPin, Sparkles } from 'lucide-react';
import { invitationConfig } from '../../config/invitation';
import { FloralOrnaments } from './FloralOrnaments';

interface InvitationCardProps {
  onOpenVideo: () => void;
  onReplay?: () => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  onOpenVideo,
  onReplay,
}) => {
  const { couple, title, headline, date, time, location, reception, buttonText, replayText } =
    invitationConfig;

  return (
    <motion.article
      initial={{ opacity: 0, y: 15, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[420px] sm:max-w-[460px] mx-auto rounded-xl p-5 sm:p-7 md:p-8 card-texture shadow-card-elevated border border-[#E9DFCE] text-center select-none overflow-hidden"
    >
      {/* Outer decorative margin border */}
      <div className="absolute inset-2 sm:inset-3 rounded-lg border border-[#D9C8AC]/40 pointer-events-none" />

      {/* Inner fine gold border with corner notches */}
      <div className="absolute inset-3.5 sm:inset-5 rounded-md border border-[#C49746]/50 pointer-events-none">
        {/* Subtle corner flourish accents */}
        <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t border-l border-[#A87B2E]" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t border-r border-[#A87B2E]" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b border-l border-[#A87B2E]" />
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b border-r border-[#A87B2E]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between min-h-[500px] sm:min-h-[540px] py-2">
        {/* Top Ornament */}
        <header className="flex flex-col items-center w-full pt-1">
          <FloralOrnaments variant="top" className="text-[#C49746] mb-2 opacity-90" />
          
          {couple.subtitle && (
            <p className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#8C7A65] mb-2 font-medium">
              {couple.subtitle}
            </p>
          )}

          <h2 className="font-serif text-xs sm:text-sm tracking-[0.35em] uppercase text-[#855F1E] font-semibold">
            {title}
          </h2>
        </header>

        {/* Center: Couple Names & Monogram */}
        <div className="my-auto py-4 flex flex-col items-center w-full">
          <div className="flex flex-col items-center">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-light tracking-wide text-[#2C2A29] leading-tight">
              {couple.person1}
            </h1>
            
            <div className="my-0.5 flex items-center justify-center">
              <span className="font-script text-3xl sm:text-4xl text-[#C49746] font-normal px-2 transform -rotate-3">
                &
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-light tracking-wide text-[#2C2A29] leading-tight">
              {couple.person2}
            </h1>
          </div>

          <FloralOrnaments variant="divider" className="my-4" />

          {headline && (
            <p className="font-serif italic text-sm sm:text-base text-[#615242] max-w-[280px] sm:max-w-[320px] leading-relaxed">
              {headline}
            </p>
          )}

          {/* Date, Time & Venue Information */}
          <div className="mt-5 flex flex-col items-center gap-1.5 text-xs sm:text-sm text-[#4A4036]">
            <div className="flex items-center gap-1.5 font-sans font-medium text-[#2C2A29] tracking-wider uppercase text-xs sm:text-[13px]">
              <Calendar className="w-3.5 h-3.5 text-[#C49746]" />
              <span>{date}</span>
              {time && (
                <>
                  <span className="text-[#C49746]">•</span>
                  <span>{time}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[#6D5E4E] font-serif text-sm sm:text-base italic">
              <MapPin className="w-3.5 h-3.5 text-[#C49746]/80 shrink-0" />
              <span>{location}</span>
            </div>

            {reception && (
              <span className="text-[11px] sm:text-xs text-[#8C7A65] font-sans tracking-wide">
                {reception}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <footer className="w-full flex flex-col items-center gap-4 pt-2">
          {/* Primary Action Button: Ver video */}
          <motion.button
            type="button"
            onClick={onOpenVideo}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-full bg-gradient-to-r from-[#855F1E] via-[#C49746] to-[#855F1E] text-white font-sans text-xs sm:text-sm uppercase tracking-[0.2em] font-medium shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C49746] focus:ring-offset-2 focus:ring-offset-[#FAF6EE] cursor-pointer"
            aria-label={`${buttonText}: ${invitationConfig.video.title}`}
          >
            {/* Shimmer sweep effect */}
            <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Play className="w-3.5 h-3.5 fill-current transition-transform duration-300 group-hover:scale-110" />
            <span>{buttonText}</span>
            <Sparkles className="w-3.5 h-3.5 text-[#FFE8B8] opacity-80" />
          </motion.button>

          {/* Secondary / Discrete Replay Action */}
          {onReplay && (
            <button
              type="button"
              onClick={onReplay}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#9B8874] hover:text-[#574433] transition-colors duration-200 tracking-wider font-sans uppercase font-medium focus:outline-none focus:underline cursor-pointer"
              title={replayText}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{replayText}</span>
            </button>
          )}

          <FloralOrnaments variant="bottom" className="text-[#C49746] mt-1 opacity-70" />
        </footer>
      </div>
    </motion.article>
  );
};
