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
          ? '0 25px 50px -12px rgba(45, 32, 18, 0.2), 0 0 0 1px rgba(196, 151, 70, 0.2)'
          : '0 4px 6px -1px rgba(45, 32, 18, 0.05), 0 0 0 1px rgba(196, 151, 70, 0.05)',
      }}
      transition={{
        duration: 1.6,
        ease: [0.16, 1, 0.3, 1], // Velvety smooth emergence forward
      }}
      style={{
        backgroundColor: theme.cardBackground,
        fontFamily: theme.fontSans,
      }}
      className="relative w-full max-w-[420px] sm:max-w-[460px] mx-auto rounded-xl p-6 sm:p-8 card-texture border border-[#E9DFCE] text-center select-none overflow-hidden"
    >
      {/* Outer decorative margin border */}
      <div className="absolute inset-2 sm:inset-3 rounded-lg border border-[#D9C8AC]/40 pointer-events-none" />

      {/* Inner fine gold border with corner notches */}
      <div
        className="absolute inset-3.5 sm:inset-5 rounded-md border pointer-events-none"
        style={{ borderColor: `${theme.primaryAccent}80` }}
      >
        {/* Subtle corner flourish accents */}
        <span
          className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t border-l"
          style={{ borderColor: theme.primaryAccentHover }}
        />
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t border-r"
          style={{ borderColor: theme.primaryAccentHover }}
        />
        <span
          className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b border-l"
          style={{ borderColor: theme.primaryAccentHover }}
        />
        <span
          className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b border-r"
          style={{ borderColor: theme.primaryAccentHover }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between min-h-[440px] sm:min-h-[480px] py-2">
        {/* Top delicate botanical ornament & Main Headline */}
        <motion.header
          initial={{ opacity: 0, y: -6 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full pt-1"
        >
          <FloralOrnaments
            variant="top"
            className="mb-3 opacity-90"
            style={{ color: theme.primaryAccent }}
          />

          <h2
            className="text-xs sm:text-sm tracking-[0.35em] uppercase font-semibold"
            style={{
              fontFamily: theme.fontSerif,
              color: theme.primaryAccentHover,
            }}
          >
            {mainPhrase}
          </h2>
        </motion.header>

        {/* Center: Couple Names, Secondary Phrase & Date */}
        <div className="my-auto py-3 flex flex-col items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 1.0, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <h1
              className="text-3xl sm:text-4xl md:text-[2.75rem] font-light tracking-wide leading-tight"
              style={{
                fontFamily: theme.fontSerif,
                color: theme.textPrimary,
              }}
            >
              {couple.person1}
            </h1>

            <div className="my-0.5 flex items-center justify-center">
              <span
                className="text-3xl sm:text-4xl font-normal px-2 transform -rotate-3 select-none"
                style={{
                  fontFamily: theme.fontScript,
                  color: theme.primaryAccent,
                }}
              >
                {couple.ampersand || '&'}
              </span>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-[2.75rem] font-light tracking-wide leading-tight"
              style={{
                fontFamily: theme.fontSerif,
                color: theme.textPrimary,
              }}
            >
              {couple.person2}
            </h1>
          </motion.div>

          {/* Secondary invitation phrase if provided */}
          {secondaryText && secondaryText.trim() !== '' && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 px-4 text-xs sm:text-sm font-light italic max-w-[280px] sm:max-w-[320px] leading-relaxed text-center"
              style={{
                fontFamily: theme.fontSerif,
                color: theme.textSecondary,
              }}
            >
              {secondaryText}
            </motion.p>
          )}

          {/* Date Information */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 1.0, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 flex items-center gap-2 text-xs sm:text-sm"
          >
            <div
              className="flex items-center gap-1.5 font-medium tracking-wider uppercase text-xs sm:text-[13px]"
              style={{
                fontFamily: theme.fontSans,
                color: theme.textSecondary,
              }}
            >
              <Calendar className="w-3.5 h-3.5" style={{ color: theme.primaryAccent }} />
              <span>{date}</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Actions: Centerpiece Ver video button & discreet replay */}
        <footer className="w-full flex flex-col items-center gap-3 pt-2">
          {/* Primary Action Button: Ver video with gold sheen sweep */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center"
          >
            <motion.button
              type="button"
              onClick={onOpenVideo}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-full text-white text-xs sm:text-sm uppercase tracking-[0.2em] font-medium shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none cursor-pointer overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryAccentHover} 0%, ${theme.primaryAccent} 50%, ${theme.primaryAccentHover} 100%)`,
                fontFamily: theme.fontSans,
              }}
              aria-label={`${buttonText}: ${invitationConfig.video.title}`}
            >
              {/* Soft gold sheen animation sweeping across button at the end of the intro */}
              <motion.span
                initial={{ x: '-140%', opacity: 0 }}
                animate={
                  isRevealed
                    ? {
                        x: ['-140%', '180%'],
                        opacity: [0, 0.75, 0],
                      }
                    : {}
                }
                transition={{
                  delay: 1.5,
                  duration: 1.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
              />

              <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Play className="w-3.5 h-3.5 fill-current transition-transform duration-300 group-hover:scale-110" />
              <span>{buttonText}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FFE8B8] opacity-80" />
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
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs transition-colors duration-200 tracking-wider uppercase font-medium focus:outline-none focus:underline cursor-pointer"
              style={{
                color: theme.textSecondary,
                fontFamily: theme.fontSans,
              }}
              title={options.replayButtonText}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{options.replayButtonText}</span>
            </motion.button>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={isRevealed ? { opacity: 0.7 } : { opacity: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <FloralOrnaments
              variant="bottom"
              className="mt-1"
              style={{ color: theme.primaryAccent }}
            />
          </motion.div>
        </footer>
      </div>
    </motion.article>
  );
};
