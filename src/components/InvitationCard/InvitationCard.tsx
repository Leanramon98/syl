import React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Calendar, Sparkles } from 'lucide-react';
import { invitationConfig } from '../../config/invitation';
import { FloralOrnaments } from './FloralOrnaments';

interface InvitationCardProps {
  onOpenVideo: () => void;
  onReplay?: () => void;
  isRevealed?: boolean;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  onOpenVideo,
  onReplay,
  isRevealed = true,
}) => {
  const { couple, mainPhrase, date, secondaryText, buttonText, theme, options } = invitationConfig;

  return (
    <motion.article
      initial={false}
      animate={{
        scale: isRevealed ? 1 : 0.88,
        y: isRevealed ? 0 : 28,
        opacity: isRevealed ? 1 : 0,
        filter: isRevealed ? 'blur(0px)' : 'blur(2px)',
        boxShadow: isRevealed
          ? '0 30px 60px -15px rgba(50, 40, 30, 0.09), 0 10px 24px -5px rgba(50, 40, 30, 0.05), 0 0 0 1px rgba(196, 151, 70, 0.12)'
          : '0 4px 6px -1px rgba(50, 40, 30, 0.04), 0 0 0 1px rgba(196, 151, 70, 0.06)',
      }}
      transition={{
        duration: 1.6,
        ease: [0.16, 1, 0.3, 1], // Velvety smooth emergence forward
      }}
      style={{
        backgroundColor: theme.cardBackground,
        fontFamily: theme.fontSans,
      }}
      className="relative w-full max-w-[420px] sm:max-w-[460px] mx-auto rounded-2xl py-10 sm:py-12 px-6 sm:px-10 card-texture border border-[#EBE3D5] text-center select-none overflow-hidden"
    >
      {/* Outer hairline border with soft margin */}
      <div className="absolute inset-2.5 sm:inset-3 rounded-xl border border-[#D9C8AC]/30 pointer-events-none" />

      {/* Inner fine gold foil border with elegant micro-notched corners */}
      <div className="absolute inset-4 sm:inset-5 rounded-lg border border-[#C49746]/45 pointer-events-none">
        {/* Micro-notched corner accents */}
        <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t border-l border-[#C49746]/70" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t border-r border-[#C49746]/70" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b border-l border-[#C49746]/70" />
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b border-r border-[#C49746]/70" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between min-h-[460px] sm:min-h-[500px]">
        {/* Top delicate botanical ornament & Main Headline */}
        <motion.header
          initial={{ opacity: 0, y: -6 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full pt-1"
        >
          <FloralOrnaments
            variant="top"
            className="mb-3 text-[#C49746]/85"
          />

          <h2 className="tracking-[0.45em] text-[10px] sm:text-xs text-[#8A6A32] font-sans font-medium uppercase">
            {mainPhrase}
          </h2>
        </motion.header>

        {/* Center: Couple Names, Secondary Phrase & Date */}
        <div className="my-auto py-4 flex flex-col items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 1.0, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <h1 className="font-serif font-light text-3xl sm:text-4xl md:text-[2.65rem] tracking-[0.03em] text-[#242220] leading-snug">
              {couple.person1}
            </h1>

            <div className="my-0.5 sm:my-1 flex items-center justify-center">
              <span className="font-script text-2xl sm:text-3xl text-[#C49746] select-none leading-none">
                {couple.ampersand || '&'}
              </span>
            </div>

            <h1 className="font-serif font-light text-3xl sm:text-4xl md:text-[2.65rem] tracking-[0.03em] text-[#242220] leading-snug">
              {couple.person2}
            </h1>
          </motion.div>

          {/* Secondary invitation phrase if provided */}
          {secondaryText && secondaryText.trim() !== '' && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 px-2 font-serif italic text-xs sm:text-[13px] text-[#786855] max-w-[270px] leading-relaxed text-center"
            >
              {secondaryText}
            </motion.p>
          )}

          {/* Date Information */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 1.0, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2 tracking-[0.3em] uppercase text-[11px] sm:text-xs font-sans text-[#52493D] font-normal">
              <Calendar className="w-3.5 h-3.5 text-[#C49746]/80" />
              <span>{date}</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Actions: Luxury Stationery Jewel Button & discreet replay */}
        <footer className="w-full flex flex-col items-center gap-3 pt-2">
          {/* Primary Action Button: Luminous warm alabaster & burnished gold satin pill button */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center"
          >
            <motion.button
              type="button"
              onClick={onOpenVideo}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
              className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-[#F1E7D5] border border-[#C49746]/60 text-[#6B4F1A] shadow-[0_4px_16px_rgba(180,140,80,0.14)] hover:shadow-[0_8px_24px_rgba(180,140,80,0.25)] hover:border-[#B38734] hover:text-[#523B0F] uppercase tracking-[0.22em] text-xs sm:text-[13px] font-sans font-medium transition-all duration-300 focus:outline-none cursor-pointer overflow-hidden"
              aria-label={`${buttonText}: ${invitationConfig.video.title}`}
            >
              {/* Sweeping soft sheen */}
              <motion.span
                initial={{ x: '-140%', opacity: 0 }}
                animate={
                  isRevealed
                    ? {
                        x: ['-140%', '180%'],
                        opacity: [0, 0.6, 0],
                      }
                    : {}
                }
                transition={{
                  delay: 1.4,
                  duration: 1.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-12 pointer-events-none"
              />

              <span className="absolute inset-0 rounded-full bg-[#C49746]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Play className="w-3.5 h-3.5 fill-[#C49746] text-[#C49746] transition-transform duration-300 group-hover:scale-110" />
              <span>{buttonText}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#C49746]/70 group-hover:text-[#C49746] transition-colors duration-300" />
            </motion.button>
          </motion.div>

          {/* Secondary / Discreet Replay Action */}
          {options.showReplayButton && onReplay && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              onClick={onReplay}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#A89885] hover:text-[#615242] transition-colors duration-200 tracking-wider uppercase font-medium focus:outline-none focus:underline cursor-pointer"
              title={options.replayButtonText}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{options.replayButtonText}</span>
            </motion.button>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={isRevealed ? { opacity: 0.75 } : { opacity: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <FloralOrnaments
              variant="bottom"
              className="mt-1 text-[#C49746]/75"
            />
          </motion.div>
        </footer>
      </div>
    </motion.article>
  );
};
