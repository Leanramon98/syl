import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, VolumeX } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#53111B] select-none">
      {/* Sound Preference Toggle */}
      {!hasStarted && (
        <div className="absolute top-5 right-5 z-40">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMusic();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#3d0d15]/80 border border-[#b4717a]/50 shadow-md text-xs font-['Plus_Jakarta_Sans',sans-serif] text-[#F9F0EA] hover:bg-[#3d0d15] transition-all cursor-pointer backdrop-blur-sm"
          >
            {isPlayingMusic ? (
              <>
                <Volume2 className="w-4 h-4 text-[#b4717a]" />
                <span className="hidden sm:inline">Música lista</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-[#D7AEA6]" />
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
        className={`relative w-full h-full max-w-[480px] max-h-[100dvh] flex items-center justify-center select-none bg-[#53111B] ${
          isRevealed ? 'pointer-events-none' : !hasStarted ? 'cursor-pointer' : ''
        }`}
        onClick={!hasStarted && !isRevealed ? handleStartPlayback : undefined}
      >
        {/* Video Player - Supports transparent WebM for Chrome/Android/Firefox, with feathered fallback for Safari */}
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
          style={{
            maskImage: 'radial-gradient(ellipse at 50% 60%, black 48%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 60%, black 48%, transparent 72%)',
          }}
        >
          <source src="/video/sobre_transparente.webm" type="video/webm; codecs=vp9" />
          <source src="/video/sobre_compuesto.mp4" type="video/mp4" />
        </video>

        {/* Interactive Intro Overlay */}
        <AnimatePresence>
          {!hasStarted && !isRevealed && (
            <motion.div
              key="seal-cue-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute inset-0 z-30 flex flex-col justify-between items-center py-10 sm:py-14 px-6 pointer-events-none select-none"
            >
              {/* Personalized Recipient Plaque at top */}
              <div className="text-center">
                <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] tracking-[0.25em] uppercase text-[#b4717a] font-semibold drop-shadow-sm block">
                  Invitación para
                </span>
                <h3 className="font-['Instrument_Serif',serif] text-3xl sm:text-5xl font-normal text-[#F9F0EA] tracking-wide drop-shadow-md my-1">
                  {groupName}
                </h3>
                <span className="font-['Plus_Jakarta_Sans',sans-serif] text-xs text-[#D7AEA6] drop-shadow-sm font-light">
                  {maxGuests === 1 ? '(1 pase reservado)' : `(${maxGuests} pases reservados)`}
                </span>
              </div>

              {/* Bottom Cue & Signoff */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="flex flex-col items-center justify-center pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartPlayback();
                  }}
                  className="group uppercase text-[11px] tracking-[0.25em] text-[#F9F0EA] font-['Plus_Jakarta_Sans',sans-serif] font-medium px-6 py-2.5 rounded-full bg-[#3d0d15]/90 border border-[#b4717a]/60 shadow-xl backdrop-blur-md flex items-center gap-2 hover:bg-[#4d131d] hover:border-[#b4717a] transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#b4717a] animate-pulse" />
                  <span>Tocar para abrir</span>
                </button>

                <div className="mt-5 sm:mt-6 select-none text-center">
                  <span className="font-['Instrument_Serif',serif] text-3xl sm:text-4xl text-[#F9F0EA] tracking-wide drop-shadow-md">
                    Sol <span className="font-['Instrument_Serif',serif] italic text-2xl sm:text-3xl text-[#b4717a]">&</span> Lea
                  </span>
                </div>
              </motion.div>
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
