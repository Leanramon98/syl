import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUp, Volume2, VolumeX } from 'lucide-react';

interface InteractiveEnvelopeIntroProps {
  groupName: string;
  maxGuests: number;
  onOpen: () => void;
  onComplete: () => void;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
}

export const InteractiveEnvelopeIntro: React.FC<InteractiveEnvelopeIntroProps> = ({
  groupName,
  maxGuests,
  onOpen,
  onComplete,
  isPlayingMusic,
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
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    setHasStarted(true);
    onOpen(); // Starts background music if allowed by browser

    video
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((error) => {
        console.warn('Video playback error with source tags, fallback to mp4:', error);
        if (video) {
          video.src = '/video/sobre_abriendose.mp4';
          video.load();
          video
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err2) => {
              console.warn('Direct MP4 playback error:', err2);
              // Fallback transition so user is never blocked
              triggerZoomTransition();
            });
        }
      });
  }, [onOpen, triggerZoomTransition]);

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

  // Auto-open after 3 seconds if user does not touch the screen
  useEffect(() => {
    const autoOpenTimer = setTimeout(() => {
      handleStartPlaybackRef.current();
    }, 3000);

    return () => clearTimeout(autoOpenTimer);
  }, []);

  const handleEnded = () => {
    if (!hasTriggeredTransition.current) {
      hasTriggeredTransition.current = true;
      triggerZoomTransition();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#BFB2A1] select-none">
      {/* Sound Preference Toggle */}
      {!hasStarted && (
        <div className="absolute top-5 right-5 z-40">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMusic();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 border border-white/60 shadow-md text-xs font-['Rubik',sans-serif] text-[#732a2d] hover:bg-white transition-all cursor-pointer backdrop-blur-sm"
          >
            {isPlayingMusic ? (
              <>
                <Volume2 className="w-4 h-4 text-[#732a2d]" />
                <span className="hidden sm:inline">Música lista</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-[#73494c]" />
                <span className="hidden sm:inline">Música silenciada</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Envelope Video Container (Seamless full-bleed stage, NO recuadro) */}
      <motion.div
        style={{
          transformOrigin: '50% 41.5%',
        }}
        animate={{
          scale: isZooming ? 1.55 : 1,
          opacity: isRevealed ? 0 : 1,
        }}
        transition={{
          scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        }}
        className={`relative w-full h-full max-w-[480px] max-h-[100dvh] flex items-center justify-center select-none bg-[#BFB2A1] ${
          isRevealed ? 'pointer-events-none' : !hasStarted ? 'cursor-pointer' : ''
        }`}
        onClick={!hasStarted && !isRevealed ? handleStartPlayback : undefined}
      >
        {/* Video Player - transparent envelope video on #BFB2A1 canvas */}
        <video
          ref={videoRef}
          muted
          playsInline
          controls={false}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          className="w-full h-full object-contain select-none pointer-events-none"
        >
          <source src="/video/sobre_sin_fondo.webm" type="video/webm" />
          <source src="/video/sobre_sin_fondo.mov" type="video/quicktime" />
          <source src="/video/sobre_abriendose.mp4" type="video/mp4" />
        </video>

        {/* Interactive Seal Cue: Translucent pulsing ring & radar target */}
        <AnimatePresence>
          {!hasStarted && !isRevealed && (
            <motion.div
              key="seal-cue-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              {/* Personalized Recipient Plaque at top */}
              <div className="absolute top-10 sm:top-14 inset-x-6 text-center">
                <span className="font-['Rubik',sans-serif] text-[10px] tracking-[0.25em] uppercase text-white/95 font-semibold drop-shadow-sm block">
                  Invitación para
                </span>
                <h3 className="font-['Raleway',sans-serif] text-lg sm:text-2xl font-bold text-white tracking-wide uppercase drop-shadow-md my-1">
                  {groupName}
                </h3>
                <span className="font-['Rubik',sans-serif] text-xs text-white/90 drop-shadow-sm font-light">
                  {maxGuests === 1 ? '(1 pase reservado)' : `(${maxGuests} pases reservados)`}
                </span>
              </div>

              {/* Touch target centered over the seal */}
              <div className="relative flex flex-col items-center justify-center">
                <button
                  type="button"
                  aria-label="Tocar para abrir invitación"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartPlayback();
                  }}
                  className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto select-none focus:outline-none"
                >
                  <span
                    className="absolute inset-0 rounded-full border border-white/60 animate-ping opacity-35 pointer-events-none"
                    style={{ animationDuration: '2.5s' }}
                  />
                  <span
                    className="absolute -inset-2 rounded-full border border-white/35 animate-pulse pointer-events-none"
                    style={{ animationDuration: '2s' }}
                  />
                  <span className="absolute -inset-2.5 rounded-full bg-white/20 blur-md pointer-events-none animate-pulse" />
                  <span className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/45 backdrop-blur-[0.5px] shadow-[inset_0_0_14px_rgba(255,255,255,0.45),0_0_16px_rgba(255,255,255,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:bg-white/[0.22] group-active:scale-95 pointer-events-none" />
                </button>
              </div>

              {/* Bouncing Arrow, "Tocar para abrir" Pill & Sol & Lea */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="absolute bottom-10 sm:bottom-14 inset-x-0 flex flex-col items-center justify-center pointer-events-none z-30"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  className="flex items-center justify-center mb-1.5"
                >
                  <ArrowUp className="w-5 h-5 text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                </motion.div>

                <div className="uppercase text-[10px] sm:text-[11px] tracking-[0.25em] text-white/95 font-sans font-medium px-4 py-1.5 rounded-full bg-white/25 border border-white/50 shadow-xl backdrop-blur-md flex items-center gap-1.5 select-none drop-shadow-sm">
                  <Sparkles className="w-3 h-3 text-white/90 animate-pulse" />
                  <span>Tocar para abrir</span>
                </div>

                <div className="mt-5 select-none">
                  <span className="font-['Parisienne',cursive] text-2xl sm:text-3xl text-white/90 drop-shadow-sm">
                    Sol <span className="font-['Raleway'] text-lg text-white/80 font-light">&</span> Lea
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* White cross-fade flash overlay during zoom-in into the invitation */}
      <motion.div
        initial={false}
        animate={{ opacity: isZooming ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 bg-white pointer-events-none z-50"
      />
    </div>
  );
};
