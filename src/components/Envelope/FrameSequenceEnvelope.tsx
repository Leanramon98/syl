import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Sparkles } from 'lucide-react';

export interface FrameSequenceEnvelopeProps {
  /** Array of frame URLs */
  frames?: string[];
  /** Main wedding announcement headline */
  mainPhrase?: string;
  /** Wedding date string */
  date?: string;
  /** Primary button label */
  buttonText?: string;
  /** Label for replay button */
  replayButtonText?: string;
  /** Callback to open the video modal */
  onOpenVideoModal: () => void;
  /** Delay before frame sequence begins (default: 800ms) */
  initialBeatMs?: number;
}

const DEFAULT_FRAMES = [
  '/frames/frame-1.png',
  '/frames/frame-2.png',
  '/frames/frame-3.png',
  '/frames/frame-4.png',
  '/frames/frame-5.png',
];

// Cross-fade animation durations for each transition:
// Frame 0 -> 1: ~0.6s
// Frame 1 -> 2: ~0.7s
// Frame 2 -> 3: ~0.7s
// Frame 3 -> 4: ~0.8s
const TRANSITION_DURATIONS = [
  0.6, // Frame 1 transition
  0.7, // Frame 2 transition
  0.7, // Frame 3 transition
  0.8, // Frame 4 transition
];

export const FrameSequenceEnvelope: React.FC<FrameSequenceEnvelopeProps> = ({
  frames = DEFAULT_FRAMES,
  mainPhrase = 'NOS CASAMOS',
  date = '15 de noviembre de 2026',
  buttonText = 'Ver video',
  replayButtonText = 'Volver a ver apertura',
  onOpenVideoModal,
  initialBeatMs = 800,
}) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [activeFrame, setActiveFrame] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Clear pending timeouts
  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach((t) => clearTimeout(t));
    timeoutRefs.current = [];
  }, []);

  // Preload all 5 frames on mount
  useEffect(() => {
    let isMounted = true;
    let loadedCount = 0;
    const total = frames.length;

    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= total && isMounted) {
          setLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= total && isMounted) {
          setLoaded(true);
        }
      };
    });

    return () => {
      isMounted = false;
      clearTimeouts();
    };
  }, [frames, clearTimeouts]);

  // Sequence controller
  const startSequence = useCallback(() => {
    clearTimeouts();
    setActiveFrame(0);
    setIsRevealed(false);

    // Frame 0 contemplation beat (800ms)
    const t1 = setTimeout(() => {
      setActiveFrame(1);
    }, initialBeatMs);

    // Frame 1 cross-fade (~600ms) -> Frame 2 at 800 + 600 = 1400ms
    const t2 = setTimeout(() => {
      setActiveFrame(2);
    }, initialBeatMs + 600);

    // Frame 2 cross-fade (~700ms) -> Frame 3 at 1400 + 700 = 2100ms
    const t3 = setTimeout(() => {
      setActiveFrame(3);
    }, initialBeatMs + 600 + 700);

    // Frame 3 cross-fade (~700ms) -> Frame 4 at 2100 + 700 = 2800ms
    const t4 = setTimeout(() => {
      setActiveFrame(4);
    }, initialBeatMs + 600 + 700 + 700);

    // Frame 4 settles (~800ms) -> Reveal overlay at 2800 + 800 = 3600ms
    const t5 = setTimeout(() => {
      setIsRevealed(true);
    }, initialBeatMs + 600 + 700 + 700 + 800);

    timeoutRefs.current = [t1, t2, t3, t4, t5];
  }, [clearTimeouts, initialBeatMs]);

  // Launch sequence once preloading completes
  useEffect(() => {
    if (loaded) {
      startSequence();
    }
  }, [loaded, startSequence]);

  // Replay handler
  const handleReplay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsRevealed(false);
    setActiveFrame(0);

    // Give a 250ms breath before restarting
    const replayTimer = setTimeout(() => {
      startSequence();
    }, 250);
    timeoutRefs.current.push(replayTimer);
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center px-2 sm:px-4 select-none">
      {/* 
        Responsive container matching exact 834/1106 frame aspect ratio
        Constrained by min(420px, 86dvh * 834 / 1106)
      */}
      <div
        style={{
          aspectRatio: '834 / 1106',
          maxWidth: 'min(420px, calc(86dvh * 834 / 1106))',
        }}
        className="relative w-full aspect-[834/1106] max-w-[420px] max-h-[86dvh] mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_-10px_rgba(50,35,25,0.22),0_0_24px_rgba(141,110,99,0.12)] border border-[#8D6E63]/25 bg-[#FAF8F5]"
      >
        {/* Subtle decorative inner framing line */}
        <div className="absolute inset-2 sm:inset-2.5 rounded-xl sm:rounded-2xl border border-[#8D6E63]/15 pointer-events-none z-10" />

        {/* Frame Layer 0 (Closed envelope - base layer) */}
        <img
          src={frames[0]}
          alt="Invitación sobre cerrado"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Sequential Cross-Fade Layers (Frames 1, 2, 3, 4) */}
        {frames.slice(1).map((frameSrc, idx) => {
          const frameIndex = idx + 1;
          const isVisible = activeFrame >= frameIndex;
          const duration = TRANSITION_DURATIONS[idx] || 0.7;

          return (
            <motion.img
              key={frameSrc}
              src={frameSrc}
              alt={`Apertura de sobre fase ${frameIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{
                duration,
                ease: [0.33, 1, 0.68, 1], // Natural ease out for silky cross-fade
              }}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />
          );
        })}

        {/* 
          Overlay on Frame 5:
          Positioned on the lower half of the inner card inside frame-5.png
          (Card boundary is ~23% to 77% horizontal, lower half is ~55% to 83% vertical)
        */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-x-[18%] sm:inset-x-[20%] top-[54%] bottom-[16%] z-20 flex flex-col items-center justify-center text-center pointer-events-auto"
            >
              <div className="w-full flex flex-col items-center justify-center gap-1.5 sm:gap-2.5">
                {/* Main Headline: "NOS CASAMOS" */}
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.1, ease: 'easeOut' }}
                  className="font-serif text-base sm:text-lg md:text-xl font-medium tracking-[0.24em] text-[#3E2723] uppercase select-text"
                  style={{
                    fontFamily: 'var(--theme-font-serif, "Cormorant Garamond", Georgia, serif)',
                  }}
                >
                  {mainPhrase}
                </motion.h2>

                {/* Date: "15 de noviembre de 2026" */}
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.22, ease: 'easeOut' }}
                  className="text-[11px] sm:text-xs md:text-[13px] font-sans tracking-[0.16em] text-[#6D4C41] font-medium uppercase"
                >
                  {date}
                </motion.p>

                {/* Primary Button: "Ver video" in warm chocolate/bronze silk gradient */}
                <motion.button
                  type="button"
                  onClick={onOpenVideoModal}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                  className="group relative mt-2 sm:mt-3 inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-b from-[#4A3228] to-[#2D1E18] text-[#F5EBE1] border border-[#8D6E63]/40 shadow-[0_4px_18px_rgba(74,50,40,0.35)] hover:shadow-[0_6px_24px_rgba(74,50,40,0.5)] hover:border-[#D7CCC8] uppercase tracking-[0.2em] text-[10px] sm:text-xs font-sans font-medium transition-all duration-300 focus:outline-none cursor-pointer overflow-hidden"
                  aria-label={buttonText}
                >
                  {/* Subtle golden silk sheen sweep */}
                  <motion.span
                    initial={{ x: '-150%', opacity: 0 }}
                    animate={{
                      x: ['-150%', '190%'],
                      opacity: [0, 0.75, 0],
                    }}
                    transition={{
                      delay: 0.6,
                      duration: 1.6,
                      repeat: Infinity,
                      repeatDelay: 3.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[#F5EBE1]/35 to-transparent skew-x-12 pointer-events-none"
                  />

                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#F5EBE1] text-[#F5EBE1] transition-transform duration-300 group-hover:scale-110" />
                  <span>{buttonText}</span>
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D7CCC8]/80 group-hover:text-[#F5EBE1] transition-colors duration-300" />
                </motion.button>

                {/* Discreet Replay Button */}
                <motion.button
                  type="button"
                  onClick={handleReplay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] sm:text-[10px] text-[#8D6E63] hover:text-[#3E2723] tracking-wider uppercase font-medium transition-colors duration-200 cursor-pointer focus:outline-none"
                  title={replayButtonText}
                >
                  <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#8D6E63]" />
                  <span>{replayButtonText}</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FrameSequenceEnvelope;
