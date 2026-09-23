import React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { invitationConfig } from '../../config/invitation';
import { CountdownTimer } from './CountdownTimer';

export interface InvitationCardProps {
  /** Callback fired when user clicks the primary video action button */
  onOpenVideo: () => void;
  /** Optional callback to replay the envelope opening animation */
  onReplay?: () => void;
  /** Whether the card content is fully revealed */
  isRevealed?: boolean;
  /** Whether the user has watched the video modal */
  hasWatchedVideo?: boolean;
  /** Main wedding announcement headline (default: 'NOS CASAMOS, ya tenemos fecha') */
  mainPhrase?: string;
  /** Secondary subtitle (default: 'Por ahora solo reservate la fecha... Más adelante te contamos más') */
  secondaryText?: string;
  /** Wedding date string (default: '15 de noviembre de 2026') */
  date?: string;
  /** Primary button label (default: 'Descubrir la fecha') */
  buttonText?: string;
  /** Countdown target date ISO string */
  countdownTargetDate?: string;
  /** Label for the discreet replay button (default: 'Volver a ver apertura') */
  replayButtonText?: string;
  /** Optional custom container class name */
  className?: string;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  onOpenVideo,
  onReplay,
  isRevealed = true,
  hasWatchedVideo = false,
  mainPhrase = invitationConfig.mainPhrase || 'NOS CASAMOS, ya tenemos fecha',
  secondaryText = invitationConfig.secondaryText || 'Por ahora solo reservate la fecha... Más adelante te contamos más',
  date = invitationConfig.date || '15 de noviembre de 2026',
  buttonText = invitationConfig.buttonText || 'Descubrir la fecha',
  countdownTargetDate = invitationConfig.countdownTargetDate || '2026-11-15T18:00:00',
  replayButtonText = invitationConfig.options.replayButtonText || 'Volver a ver apertura',
  className = '',
}) => {
  return (
    <article
      style={{
        fontFamily: invitationConfig.theme.fontSans,
      }}
      className={`relative min-h-[100svh] min-h-[100dvh] w-full flex flex-col items-center justify-center py-6 sm:py-10 md:py-12 px-5 sm:px-6 select-none ${className}`}
    >
      {/* Unified Optical Center Editorial Block */}
      <div className="w-full max-w-[340px] sm:max-w-md mx-auto my-auto flex flex-col items-center text-center -translate-y-1 sm:-translate-y-3">
        
        {/* 1. Logo Monograma (Identifica con sutileza y pureza sin competir) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <img
            src="/monogram-clean.png"
            alt="Monograma S & L"
            className="w-16 h-auto sm:w-20 md:w-22 object-contain select-none pointer-events-none drop-shadow-xs"
          />
        </motion.div>

        {/* 2. Headline & 3. Bajada (Protagonismo principal con espaciado controlado) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center mt-6 sm:mt-9 md:mt-11 px-1"
        >
          {/* Headline: Bolder, 2 lines on mobile, single line on desktop */}
          <h1
            className="font-sans font-semibold text-[#2C1D18] tracking-[0.16em] sm:tracking-[0.24em] text-[1.12rem] sm:text-[1.28rem] md:text-[1.38rem] leading-[1.35] uppercase"
            style={{ fontFamily: invitationConfig.theme.fontSans }}
          >
            {mainPhrase.includes(',') ? (
              <>
                <span className="block sm:inline">{mainPhrase.split(',')[0]},</span>{' '}
                <span className="block sm:inline">{mainPhrase.split(',')[1].trim()}</span>
              </>
            ) : (
              <span>{mainPhrase}</span>
            )}
          </h1>

          {/* Bajada: Sutil y legible */}
          {secondaryText && (
            <p
              className="font-serif italic text-xs sm:text-sm md:text-[15px] text-[#6E4138] mt-2.5 sm:mt-3 max-w-[270px] sm:max-w-xs leading-relaxed"
              style={{ fontFamily: invitationConfig.theme.fontSerif }}
            >
              Por ahora solo reservate la fecha...
              <br className="hidden sm:inline" />
              {' '}Más adelante te contamos más
            </p>
          )}
        </motion.div>

        {/* 4. Fecha & 5. Countdown (Aparece tras descubrir la fecha / ver el video) */}
        {hasWatchedVideo && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center mt-5 sm:mt-6"
          >
            <p
              className="font-serif text-base sm:text-lg md:text-xl font-light text-[#2C1D18] tracking-wide mb-2.5 sm:mb-3"
              style={{ fontFamily: invitationConfig.theme.fontSerif }}
            >
              {date}
            </p>

            <CountdownTimer
              targetDate={countdownTargetDate}
              isRevealed={true}
            />
          </motion.div>
        )}

        {/* 6. CTA Principal (#9aa289) & 7. Acción Secundaria */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.7, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center mt-7 sm:mt-9 md:mt-10"
        >
          {/* CTA Button en tono #9aa289: 90-100% en mobile (w-full max-w-[330px]), proporcional en desktop */}
          <motion.button
            type="button"
            onClick={onOpenVideo}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full max-w-[330px] sm:max-w-[310px] py-3.5 sm:py-3.5 rounded-full bg-[#9aa289] hover:bg-[#8d957d] active:bg-[#838b73] text-white border border-[#8a927a]/60 hover:border-[#7c846a] shadow-[0_4px_16px_rgba(154,162,137,0.3)] hover:shadow-[0_6px_20px_rgba(154,162,137,0.4)] transition-all duration-300 flex items-center justify-center gap-2.5 uppercase tracking-[0.22em] text-[11px] sm:text-xs font-sans font-medium cursor-pointer select-none overflow-hidden focus:outline-none"
            aria-label={buttonText}
          >
            {/* Satin sheen sweep */}
            <motion.span
              initial={{ x: '-150%', opacity: 0 }}
              animate={
                isRevealed
                  ? {
                      x: ['-150%', '200%'],
                      opacity: [0, 0.4, 0],
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
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
            />

            <Play className="w-3.5 h-3.5 fill-white text-white transition-transform duration-300 group-hover:scale-110" />
            <span>{buttonText}</span>
          </motion.button>

          {/* Acción secundaria: Volver a ver apertura */}
          {onReplay && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={onReplay}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#8D6E63] hover:text-[#b4717a] transition-colors duration-200 tracking-wider uppercase font-medium focus:outline-none cursor-pointer mt-3 sm:mt-3.5 select-none"
              title={replayButtonText}
            >
              <RotateCcw className="w-3 h-3 text-[#8D6E63]" />
              <span>{replayButtonText}</span>
            </motion.button>
          )}

          {/* 8. Cierre de firma: Sol & Lea al final de todo */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ delay: 0.68, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-1.5 sm:gap-2 mt-7 sm:mt-9 select-none"
          >
            <span
              className="font-serif font-light text-xl sm:text-2xl tracking-[0.08em] text-[#2C1D18]"
              style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
            >
              Sol
            </span>
            <span
              className="font-script text-xl sm:text-2xl text-[#b4717a] select-none -translate-y-0.5"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              &
            </span>
            <span
              className="font-serif font-light text-xl sm:text-2xl tracking-[0.08em] text-[#2C1D18]"
              style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
            >
              Lea
            </span>
          </motion.div>
        </motion.div>

      </div>
    </article>
  );
};

export default InvitationCard;
