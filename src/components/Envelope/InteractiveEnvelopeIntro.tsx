import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, VolumeX } from 'lucide-react';

interface InteractiveEnvelopeIntroProps {
  groupName: string;
  maxGuests: number;
  onOpen: () => void;
  onComplete: () => void;
  isMusicEnabled: boolean;
  onToggleMusic: () => void;
}

export const InteractiveEnvelopeIntro: React.FC<InteractiveEnvelopeIntroProps> = ({
  groupName,
  maxGuests,
  onOpen,
  onComplete,
  isMusicEnabled,
  onToggleMusic,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const hasTriggeredTransition = useRef<boolean>(false);
  const transitionTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const rafRef = useRef<number | null>(null);

  const clearTimeouts = useCallback(() => {
    transitionTimeoutsRef.current.forEach(clearTimeout);
    transitionTimeoutsRef.current = [];
  }, []);

  // Continuous push-in zoom: scale 1 -> 1.55, cross-fading into full page over ~500ms
  const triggerZoomTransition = useCallback(() => {
    clearTimeouts();
    setIsZooming(true);
    setIsRevealed(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const pauseTimer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      onComplete();
    }, 550);

    transitionTimeoutsRef.current = [pauseTimer];
  }, [clearTimeouts, onComplete]);

  // Video timeupdate check: trigger 1 second before end (video duration ~3.0s -> triggers at 2.0s)
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const threshold = video.duration ? Math.max(0.5, video.duration - 1.0) : 2.0;
    if (!hasTriggeredTransition.current && video.currentTime >= threshold) {
      hasTriggeredTransition.current = true;
      triggerZoomTransition();
    }
  }, [triggerZoomTransition]);

  // Frame-accurate RAF loop for instantaneous zoom detection
  useEffect(() => {
    let active = true;

    const checkTime = () => {
      if (!active) return;
      const video = videoRef.current;
      if (video && isPlaying && !hasTriggeredTransition.current) {
        const threshold = video.duration ? Math.max(0.5, video.duration - 1.0) : 2.0;
        if (video.currentTime >= threshold) {
          hasTriggeredTransition.current = true;
          triggerZoomTransition();
          return;
        }
      }
      if (isPlaying && !hasTriggeredTransition.current) {
        rafRef.current = requestAnimationFrame(checkTime);
      }
    };

    if (isPlaying && !hasTriggeredTransition.current) {
      rafRef.current = requestAnimationFrame(checkTime);
    }

    return () => {
      active = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, triggerZoomTransition]);

  const handleStartPlayback = useCallback(() => {
    if (hasStarted || isRevealed) return;

    const video = videoRef.current;
    if (!video) return;

    setHasStarted(true);

    // Call onOpen synchronously to trigger audio within user interaction gesture
    try {
      onOpen();
    } catch (e) {
      console.warn('Audio onOpen error:', e);
    }

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    // Start video playback (muted is allowed on all mobile browsers)
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.warn('Video playback error with source tags, fallback to mp4:', error);
          if (video) {
            video.src = '/video/sobre_compuesto.mp4';
            video.load();
            video
              .play()
              .then(() => {
                setIsPlaying(true);
              })
              .catch((err2) => {
                console.warn('Direct MP4 playback error:', err2);
                // Only skip if playback is genuinely unrecoverable
                triggerZoomTransition();
              });
          }
        });
    }
  }, [hasStarted, isRevealed, onOpen, triggerZoomTransition]);

  const handleStartPlaybackRef = useRef(handleStartPlayback);
  useEffect(() => {
    handleStartPlaybackRef.current = handleStartPlayback;
  }, [handleStartPlayback]);

  // Ensure video element attributes and source loading on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.load();
  }, []);

  // Auto-open after 5 seconds if user does not touch the screen
  useEffect(() => {
    const autoOpenTimer = setTimeout(() => {
      handleStartPlaybackRef.current();
    }, 5000);

    return () => clearTimeout(autoOpenTimer);
  }, []);

  const handleEnded = () => {
    if (!hasTriggeredTransition.current) {
      hasTriggeredTransition.current = true;
      triggerZoomTransition();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#F9F0EA] select-none">
      {/* Sound Preference Toggle */}
      {!hasStarted && (
        <div className="absolute top-5 right-5 z-40">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMusic();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 border border-[#b4717a]/40 shadow-sm text-xs font-['Plus_Jakarta_Sans',sans-serif] text-[#53111B] hover:bg-white transition-all cursor-pointer backdrop-blur-sm"
          >
            {isMusicEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-[#53111B]" />
                <span className="hidden sm:inline">Música</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-[#9A7B6A]" />
                <span className="hidden sm:inline">Silenciada</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Envelope Stage */}
      <motion.div
        style={{
          transformOrigin: '50% 50%',
        }}
        animate={{
          scale: isZooming ? 1.55 : 1,
          opacity: isRevealed ? 0 : 1,
        }}
        transition={{
          scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        }}
        className={`relative w-full h-full select-none bg-[#F9F0EA] ${
          isRevealed ? 'pointer-events-none' : !hasStarted ? 'cursor-pointer' : ''
        }`}
        onClick={!hasStarted && !isRevealed ? handleStartPlayback : undefined}
      >
        {/* Full-width Center Envelope Video (persists throughout playback) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-full max-w-[440px] flex items-center justify-center"
            style={{
              aspectRatio: '1086 / 1448',
            }}
          >
            <video
              ref={videoRef}
              src="/video/sobre_compuesto.mp4"
              muted
              playsInline
              controls={false}
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleEnded}
              className="w-full h-full object-contain select-none drop-shadow-sm"
            />
          </div>
        </div>

        {/* Foreground Plaque & CTA (fades out smoothly when opening begins) */}
        <AnimatePresence>
          {!hasStarted && !isRevealed && (
            <motion.div
              key="envelope-stage-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative z-20 w-full h-full max-w-md mx-auto flex flex-col justify-between items-center py-6 sm:py-10 px-5 pointer-events-none"
            >
              {/* Top Plaque: Botanical emblem + Recipient Info */}
              <div className="text-center pt-1 sm:pt-3 flex flex-col items-center">
                {/* Botanical Laurel Motif */}
                <div className="mb-2 text-[#b4717a] opacity-85">
                  <svg
                    viewBox="0 0 44 30"
                    className="w-8 h-6 mx-auto stroke-current"
                    fill="none"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4v22" />
                    <path d="M22 4c-1.3 1.3-1.3 3.2 0 4.5 1.3-1.3 1.3-3.2 0-4.5z" />
                    <path d="M22 11c-3.6-1-6.6.4-8.6 3 2.9 1 5.9.2 8.6-2" />
                    <path d="M22 11c3.6-1 6.6.4 8.6 3-2.9 1-5.9.2-8.6-2" />
                    <path d="M22 17c-3-.8-5.4.3-7 2.5 2.4.9 5 .2 7-1.7" />
                    <path d="M22 17c3-.8 5.4.3 7 2.5-2.4.9-5 .2-7-1.7" />
                    <path d="M22 23c-2.2-.6-4 .2-5.3 1.9 1.8.7 3.8.1 5.3-1.3" />
                    <path d="M22 23c2.2-.6 4 .2 5.3 1.9-1.8.7-3.8.1-5.3-1.3" />
                  </svg>
                </div>

                <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] sm:text-xs tracking-[0.3em] uppercase text-[#b4717a] font-semibold drop-shadow-sm block mb-1">
                  Invitación para
                </span>
                <h3 className="font-['Instrument_Serif',serif] text-4xl sm:text-5xl font-normal text-[#53111B] tracking-wide my-1">
                  {groupName}
                </h3>
                <span className="font-['Plus_Jakarta_Sans',sans-serif] text-xs sm:text-sm text-[#734149] font-light">
                  {maxGuests === 1 ? '(1 pase reservado)' : `(${maxGuests} pases reservados)`}
                </span>
              </div>

              {/* Center transparent spacer: Allows clicking through to the envelope */}
              <div className="flex-1 w-full" />

              {/* Bottom CTA, Signoff with Hairline Dividers & Wedding Date */}
              <div className="w-full flex flex-col items-center justify-center pb-2 sm:pb-4 pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartPlayback();
                  }}
                  className="w-[82%] max-w-[320px] uppercase text-xs tracking-[0.25em] text-[#F9F0EA] font-['Plus_Jakarta_Sans',sans-serif] font-medium py-3 sm:py-3.5 rounded-full bg-[#53111B] border border-[#b4717a]/40 shadow-xl flex items-center justify-center gap-2 hover:bg-[#681824] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E5D9C5] animate-pulse" />
                  <span>Tocar para abrir</span>
                </button>

                {/* Names flanked by thin hairline rules: ─── Sol & Lea ─── */}
                <div className="w-full max-w-[320px] flex items-center justify-center gap-3 mt-4 sm:mt-5 select-none">
                  <span className="flex-1 h-[1px] bg-[#b4717a]/35" />
                  <span className="font-['Instrument_Serif',serif] text-2xl sm:text-3xl text-[#53111B] tracking-wide whitespace-nowrap">
                    Sol <span className="font-['Instrument_Serif',serif] italic text-xl sm:text-2xl text-[#b4717a]">&</span> Lea
                  </span>
                  <span className="flex-1 h-[1px] bg-[#b4717a]/35" />
                </div>

                {/* Wedding Date in subtle tracked typography */}
                <div className="mt-1.5 select-none text-center">
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] sm:text-[11px] tracking-[0.25em] text-[#734149]/80 uppercase font-light">
                    06 . 03 . 2027
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Soft fade overlay during zoom-in into the invitation */}
      <motion.div
        initial={false}
        animate={{ opacity: isZooming ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 bg-[#F9F0EA] pointer-events-none z-50"
      />
    </div>
  );
};
