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
    if (hasStarted || isRevealed) return;

    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    setHasStarted(true);
    onOpen(); // Starts background music immediately when envelope starts opening!

    video
      .play()
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
              // Fallback transition so user is never blocked
              triggerZoomTransition();
            });
        }
      });
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
        className={`relative w-full h-full flex flex-col items-center justify-center select-none bg-[#53111B] ${
          isRevealed ? 'pointer-events-none' : !hasStarted ? 'cursor-pointer' : ''
        }`}
        onClick={!hasStarted && !isRevealed ? handleStartPlayback : undefined}
      >
        {/* Top Plaque: Recipient Info */}
        <AnimatePresence>
          {!hasStarted && !isRevealed && (
            <motion.div
              key="recipient-plaque"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute top-7 sm:top-10 inset-x-6 text-center z-30 pointer-events-none"
            >
              <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] tracking-[0.25em] uppercase text-[#b4717a] font-semibold drop-shadow-sm block">
                Invitación para
              </span>
              <h3 className="font-['Instrument_Serif',serif] text-3xl sm:text-5xl font-normal text-[#F9F0EA] tracking-wide drop-shadow-md my-1">
                {groupName}
              </h3>
              <span className="font-['Plus_Jakarta_Sans',sans-serif] text-xs text-[#D7AEA6] drop-shadow-sm font-light">
                {maxGuests === 1 ? '(1 pase reservado)' : `(${maxGuests} pases reservados)`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video & Seal wrapper: Locked to the exact aspect ratio 1086/1448 of the envelope video */}
        <div
          className="relative w-full flex items-center justify-center"
          style={{
            maxWidth: 'min(440px, calc(82dvh * 1086 / 1448))',
            aspectRatio: '1086 / 1448',
          }}
        >
          {/* Video Player - Supports transparent WebM with feathered fallback for Safari */}
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

          {/* SEAL PULSING CUE - LOCKED EXACTLY OVER THE WAX SEAL */}
          <AnimatePresence>
            {!hasStarted && !isRevealed && (
              <motion.div
                key="seal-hotspot"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.25 } }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute flex items-center justify-center pointer-events-auto"
                style={{
                  left: '49.45%',
                  top: '62.91%',
                  width: '20.5%',
                  aspectRatio: '1 / 1',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 35,
                }}
              >
                <button
                  type="button"
                  aria-label="Tocar sello para abrir invitación"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartPlayback();
                  }}
                  className="group relative w-full h-full rounded-full flex items-center justify-center cursor-pointer select-none focus:outline-none"
                >
                  {/* Subtle ping ring aligned with seal perimeter */}
                  <span
                    className="absolute inset-0 rounded-full border-2 border-[#b4717a]/70 animate-ping opacity-40 pointer-events-none"
                    style={{ animationDuration: '2.5s' }}
                  />
                  {/* Gentle pulsing aura around the seal perimeter */}
                  <span
                    className="absolute -inset-1 rounded-full border border-[#b4717a]/50 animate-pulse pointer-events-none"
                    style={{ animationDuration: '2s' }}
                  />
                  {/* Glass tint highlight */}
                  <span className="absolute inset-0 rounded-full bg-[#b4717a]/15 border border-[#b4717a]/35 backdrop-blur-[0.5px] shadow-[inset_0_0_12px_rgba(180,113,122,0.4),0_0_14px_rgba(180,113,122,0.3)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#b4717a]/25 group-active:scale-95 pointer-events-none" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom CTA and Signoff */}
        <AnimatePresence>
          {!hasStarted && !isRevealed && (
            <motion.div
              key="bottom-cue"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12, transition: { duration: 0.25 } }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="absolute bottom-6 sm:bottom-10 inset-x-0 flex flex-col items-center justify-center z-30 pointer-events-auto"
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

              <div className="mt-4 sm:mt-5 select-none text-center">
                <span className="font-['Instrument_Serif',serif] text-3xl sm:text-4xl text-[#F9F0EA] tracking-wide drop-shadow-md">
                  Sol <span className="font-['Instrument_Serif',serif] italic text-2xl sm:text-3xl text-[#b4717a]">&</span> Lea
                </span>
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
