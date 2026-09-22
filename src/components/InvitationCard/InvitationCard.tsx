import React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import { invitationConfig } from '../../config/invitation';

export interface InvitationCardProps {
  /** Callback fired when user clicks the primary video action button */
  onOpenVideo: () => void;
  /** Optional callback to replay the envelope opening animation */
  onReplay?: () => void;
  /** Whether the card content is fully revealed */
  isRevealed?: boolean;
  /** Main wedding announcement headline (default: 'NOS CASAMOS') */
  mainPhrase?: string;
  /** Wedding date string (default: '15 de noviembre de 2026') */
  date?: string;
  /** Primary button label (default: 'Ver video') */
  buttonText?: string;
  /** Label for the discreet replay button (default: 'Volver a ver apertura') */
  replayButtonText?: string;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  onOpenVideo,
  onReplay,
  isRevealed = true,
  mainPhrase = 'NOS CASAMOS',
  date = invitationConfig.date || '15 de noviembre de 2026',
  buttonText = invitationConfig.buttonText || 'Ver video',
  replayButtonText = invitationConfig.options.replayButtonText || 'Volver a ver apertura',
}) => {
  return (
    <article
      style={{
        backgroundColor: '#FAF8F3',
        fontFamily: invitationConfig.theme.fontSans,
      }}
      className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 text-center select-none overflow-hidden"
    >
      {/* Outer hairline border in chocolate burgundy matching video */}
      <div className="absolute inset-3 sm:inset-3.5 rounded-xl border border-[#6E4138]/60 pointer-events-none" />

      {/* Inner hairline border in chocolate burgundy matching video */}
      <div className="absolute inset-[18px] sm:inset-5 rounded-lg border border-[#6E4138]/40 pointer-events-none" />

      {/* Top Section: Monogram Logo positioned identically to video ~5.5s-6.0s */}
      <div className="relative z-10 w-full flex flex-col items-center pt-3 sm:pt-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isRevealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center items-center"
        >
          <img
            src="/monogram-clean.png"
            alt="Monograma S & L"
            className="w-[115px] sm:w-[125px] h-auto object-contain select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(110,65,56,0.08)]"
          />
        </motion.div>
      </div>

      {/* Center Section: Headline & Date with refined tracking in chocolate tone */}
      <div className="relative z-10 w-full flex flex-col items-center my-auto py-2">
        {/* Headline: "NOS CASAMOS" */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-lg sm:text-xl md:text-2xl font-normal tracking-[0.32em] text-[#3E2723] uppercase"
          style={{
            fontFamily: invitationConfig.theme.fontSerif,
          }}
        >
          {mainPhrase}
        </motion.h1>

        {/* Date: "15 de noviembre de 2026" in #5D4037 */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2.5 text-xs sm:text-[13px] font-sans tracking-[0.2em] text-[#5D4037] font-medium uppercase"
          style={{
            fontFamily: invitationConfig.theme.fontSans,
          }}
        >
          {date}
        </motion.p>
      </div>

      {/* Bottom Section: Primary Action Button & Discreet Replay Action */}
      <footer className="relative z-10 w-full flex flex-col items-center gap-2.5 pb-2">
        {/* Primary button: "Ver video" luxury satin pill in warm chocolate/bronze/gold gradient */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex justify-center"
        >
          <motion.button
            type="button"
            onClick={onOpenVideo}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-b from-[#4A3026] via-[#382119] to-[#26150F] border border-[#8D6E63]/50 hover:border-[#C49746] text-[#FDFBF7] shadow-[0_6px_20px_rgba(50,30,20,0.32)] hover:shadow-[0_8px_28px_rgba(70,35,20,0.45)] uppercase tracking-[0.22em] text-xs sm:text-[13px] font-sans font-medium transition-all duration-300 focus:outline-none cursor-pointer overflow-hidden"
            aria-label={buttonText}
          >
            {/* Continuous sweeping soft golden sheen */}
            <motion.span
              initial={{ x: '-150%', opacity: 0 }}
              animate={
                isRevealed
                  ? {
                      x: ['-150%', '190%'],
                      opacity: [0, 0.7, 0],
                    }
                  : {}
              }
              transition={{
                delay: 0.6,
                duration: 1.6,
                repeat: Infinity,
                repeatDelay: 3.0,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[#FFFDF9]/40 to-transparent skew-x-12 pointer-events-none"
            />

            <Play className="w-3.5 h-3.5 fill-[#E5CA96] text-[#E5CA96] transition-transform duration-300 group-hover:scale-110" />
            <span>{buttonText}</span>
            <Sparkles className="w-3.5 h-3.5 text-[#E5CA96]/80 group-hover:text-[#E5CA96] transition-colors duration-300" />
          </motion.button>
        </motion.div>

        {/* Discreet Replay Button: "Volver a ver apertura" */}
        {onReplay && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            onClick={onReplay}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#8D6E63] hover:text-[#3E2723] transition-colors duration-200 tracking-wider uppercase font-medium focus:outline-none cursor-pointer pt-0.5"
            title={replayButtonText}
          >
            <RotateCcw className="w-3 h-3 text-[#8D6E63]" />
            <span>{replayButtonText}</span>
          </motion.button>
        )}
      </footer>
    </article>
  );
};

export default InvitationCard;
