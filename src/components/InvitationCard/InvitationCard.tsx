import React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
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
  /** Optional custom container class name */
  className?: string;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  onOpenVideo,
  onReplay,
  isRevealed = true,
  mainPhrase = 'NOS CASAMOS',
  date = invitationConfig.date || '15 de noviembre de 2026',
  buttonText = invitationConfig.buttonText || 'Ver video',
  replayButtonText = invitationConfig.options.replayButtonText || 'Volver a ver apertura',
  className = '',
}) => {
  return (
    <article
      style={{
        fontFamily: invitationConfig.theme.fontSans,
      }}
      className={`relative min-h-[100dvh] w-full flex flex-col justify-between items-center py-12 sm:py-16 px-6 max-w-md mx-auto text-center select-none ${className}`}
    >
      {/* Top Section: Monogram Logo (w-28 sm:w-32) with staggered entrance (delay 0.15s, y: 8 -> 0) */}
      <div className="w-full flex flex-col items-center pt-2 sm:pt-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center items-center"
        >
          <img
            src="/monogram-clean.png"
            alt="Monograma S & L"
            className="w-28 sm:w-32 h-auto object-contain select-none pointer-events-none"
          />
        </motion.div>
      </div>

      {/* Center Section: Headline & Date with generous breathing space & staggered entrance (delay 0.35s, y: 10 -> 0) */}
      <div className="w-full flex flex-col items-center justify-center my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* "NOS CASAMOS" with airy tracking */}
          <h1
            className="tracking-[0.42em] text-[11px] sm:text-xs font-sans text-[#5D4037] uppercase font-medium"
            style={{
              fontFamily: invitationConfig.theme.fontSans,
            }}
          >
            {mainPhrase}
          </h1>

          {/* "15 de noviembre de 2026" */}
          <p
            className="font-serif text-lg sm:text-xl font-light text-[#2C1D18] tracking-wide mt-3"
            style={{
              fontFamily: invitationConfig.theme.fontSerif,
            }}
          >
            {date}
          </p>
        </motion.div>
      </div>

      {/* Bottom Section: Primary CTA Button (w-[76%] max-w-[320px], py-3.5 sm:py-4) & Discreet Replay link */}
      <footer className="w-full flex flex-col items-center pb-2 sm:pb-4">
        {/* CTA Button with staggered entrance (delay 0.55s, y: 12 -> 0) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex justify-center"
        >
          <motion.button
            type="button"
            onClick={onOpenVideo}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-[76%] max-w-[320px] py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#3E2922] via-[#2F1E19] to-[#3E2922] text-[#F7F2EA] border border-[#7D5A4F]/40 hover:border-[#A88276] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2.5 uppercase tracking-[0.24em] text-[11px] sm:text-xs font-sans font-medium cursor-pointer select-none overflow-hidden focus:outline-none"
            aria-label={buttonText}
          >
            {/* Noble, subtle satin sheen sweep */}
            <motion.span
              initial={{ x: '-150%', opacity: 0 }}
              animate={
                isRevealed
                  ? {
                      x: ['-150%', '200%'],
                      opacity: [0, 0.45, 0],
                    }
                  : {}
              }
              transition={{
                delay: 1.0,
                duration: 2.2,
                repeat: Infinity,
                repeatDelay: 4.0,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[#FFF8EC]/25 to-transparent skew-x-12 pointer-events-none"
            />

            <Play className="w-3.5 h-3.5 fill-[#D4AF67] text-[#D4AF67] transition-transform duration-300 group-hover:scale-110" />
            <span>{buttonText}</span>
          </motion.button>
        </motion.div>

        {/* Discreet Replay link with staggered entrance (delay 0.75s, opacity: 0 -> 1) */}
        {onReplay && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.75, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onClick={onReplay}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#8D6E63] hover:text-[#3E2922] transition-colors duration-200 tracking-wider uppercase font-medium focus:outline-none cursor-pointer mt-3.5"
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
