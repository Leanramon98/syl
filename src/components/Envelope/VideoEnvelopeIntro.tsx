import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUp } from 'lucide-react';
import { InvitationCard } from '../InvitationCard/InvitationCard';

export interface VideoEnvelopeIntroProps {
  /** Video source URL or public file path (default: '/intro-envelope.mp4') */
  videoSrc?: string;
  /** Whether the intro should autoplay immediately (default: false) */
  autoPlayIntro?: boolean;
  /** Callback fired when user clicks the primary action button to open the video modal */
  onOpenVideoModal: () => void;
  /** Primary button label */
  buttonText?: string;
  /** Main wedding announcement headline */
  mainPhrase?: string;
  /** Secondary subtitle (e.g. 'Ya tenemos fecha') */
  secondaryText?: string;
  /** Wedding date string */
  date?: string;
  /** Target date ISO string for macOS countdown */
  countdownTargetDate?: string;
  /** Label for replay button */
  replayButtonText?: string;
}

export const VideoEnvelopeIntro: React.FC<VideoEnvelopeIntroProps> = ({
  videoSrc = '/intro-envelope.mp4',
  autoPlayIntro = false,
  onOpenVideoModal,
  buttonText = 'Save the Date',
  mainPhrase = 'NOS CASAMOS',
  secondaryText = 'Ya tenemos fecha',
  date,
  countdownTargetDate,
  replayButtonText = 'Volver a ver apertura',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(autoPlayIntro);
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [isCardRevealed, setIsCardRevealed] = useState<boolean>(false);

  const hasTriggeredTransition = useRef<boolean>(false);
  const transitionTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const rafRef = useRef<number | null>(null);

  // Clear pending transition timeouts
  const clearTimeouts = useCallback(() => {
    transitionTimeoutsRef.current.forEach(clearTimeout);
    transitionTimeoutsRef.current = [];
  }, []);

  // Continuous push-in zoom: scale 1 -> 1.55 with origin '50% 41.5%',
  // envelope physical borders expand past viewport, cross-fading into final editorial page over ~500ms
  const triggerZoomTransition = useCallback(() => {
    clearTimeouts();
    setIsZooming(true);
    setIsCardRevealed(true);

    // Pause video after the 500ms cross-fade completes
    const pauseTimer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }, 550);

    transitionTimeoutsRef.current = [pauseTimer];
  }, [clearTimeouts]);

  // Video timeupdate check (triggers transition at ~5.05s)
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!hasTriggeredTransition.current && video.currentTime >= 5.05) {
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
        if (video.currentTime >= 5.05) {
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

  // Start playback upon user interaction (tapping seal or clicking envelope)
  const handleStartPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    setHasStarted(true);
    video
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((error) => {
        console.warn('Video playback error:', error);
        setHasStarted(false);
        setIsPlaying(false);
      });
  }, []);

  // Initialize video muted state; conditionally autoplay only if autoPlayIntro is true
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    if (autoPlayIntro) {
      handleStartPlayback();
    } else {
      video.pause();
      video.currentTime = 0;
    }

    return () => {
      clearTimeouts();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [videoSrc, autoPlayIntro, handleStartPlayback, clearTimeouts]);

  // Replay intro video: smoothly returns to Stage 1 with closed envelope and interactive seal
  const handleReplay = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      clearTimeouts();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      setIsCardRevealed(false);
      setIsZooming(false);
      hasTriggeredTransition.current = false;
      setIsPlaying(false);
      setHasStarted(false);

      const video = videoRef.current;
      if (!video) return;

      video.pause();
      video.currentTime = 0;
    },
    [clearTimeouts]
  );

  // Handle video end fallback if reached before 5.05s
  const handleEnded = () => {
    if (!hasTriggeredTransition.current) {
      hasTriggeredTransition.current = true;
      triggerZoomTransition();
    }
  };

  return (
    <div className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* 
        Stage 1 & Playing Envelope Container:
        - Initial size: max-w expanded to min(470px, calc(92dvh * 9 / 16)) (~20-25% increase)
        - Push-in zoom at ~5.0s: scale 1 -> 1.55, transformOrigin: '50% 41.5%'
        - Envelope physical borders push past viewport boundaries
        - Cross-fade over 500ms into final editorial page
      */}
      <motion.div
        style={{
          aspectRatio: '9 / 16',
          maxWidth: 'min(470px, calc(92dvh * 9 / 16))',
          transformOrigin: '50% 41.5%',
        }}
        animate={{
          scale: isZooming ? 1.55 : 1,
          opacity: isCardRevealed ? 0 : 1,
        }}
        transition={{
          scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        }}
        className={`relative w-full aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_-10px_rgba(40,30,20,0.22)] border border-[#6E4138]/20 bg-[#FAF8F3] flex items-center justify-center select-none ${
          isCardRevealed
            ? 'pointer-events-none'
            : !hasStarted
            ? 'cursor-pointer'
            : ''
        }`}
        onClick={!hasStarted && !isCardRevealed ? handleStartPlayback : undefined}
      >
        {/* Video Player */}
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          controls={false}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          className="w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Interactive Chapita / Wax Seal Cue: Pulsing ring & luxury badge */}
        <AnimatePresence>
          {!hasStarted && !isCardRevealed && (
            <motion.div
              key="chapita-cue-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <div className="relative flex flex-col items-center justify-center">
                {/* Touch target centered over the seal (50% x 50%) */}
                <button
                  type="button"
                  aria-label="Tocar para abrir invitación"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartPlayback();
                  }}
                  className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto select-none focus:outline-none"
                >
                  {/* Subtle pulsing translucent white radar / ripple ring */}
                  <span
                    className="absolute inset-0 rounded-full border border-white/60 animate-ping opacity-35 pointer-events-none"
                    style={{ animationDuration: '2.5s' }}
                  />
                  <span
                    className="absolute -inset-2 rounded-full border border-white/35 animate-pulse pointer-events-none"
                    style={{ animationDuration: '2s' }}
                  />

                  {/* Soft translucent white glowing halo */}
                  <span className="absolute -inset-2.5 rounded-full bg-white/20 blur-md pointer-events-none animate-pulse" />

                  {/* Frosted translucent white glass lens over the seal */}
                  <span className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/45 backdrop-blur-[0.5px] shadow-[inset_0_0_14px_rgba(255,255,255,0.45),0_0_16px_rgba(255,255,255,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:bg-white/[0.22] group-active:scale-95 pointer-events-none" />
                </button>
              </div>

              {/* Indicator positioned lower down with an animated arrow pointing up to the seal button */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="absolute bottom-7 sm:bottom-9 inset-x-0 flex flex-col items-center justify-center pointer-events-none z-30"
              >
                {/* Animated bouncing arrow pointing directly up to the chapita button */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  className="flex items-center justify-center mb-1.5"
                >
                  <ArrowUp className="w-5 h-5 text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                </motion.div>

                {/* Elegant translucent frosted white pill */}
                <div className="uppercase text-[10px] sm:text-[11px] tracking-[0.25em] text-white/95 font-sans font-medium px-4 py-1.5 rounded-full bg-white/20 border border-white/45 shadow-xl backdrop-blur-md flex items-center gap-1.5 select-none drop-shadow-sm">
                  <Sparkles className="w-3 h-3 text-white/90 animate-pulse" />
                  <span>Tocar para abrir</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 
        Final Editorial Stationery Page:
        - Cross-fades in over 500ms
        - Full vertical editorial composition (min-h-[100dvh])
        - Card surface seamlessly becomes the page background with matching #FAF8F3 paper texture
        - No physical card borders visible
      */}
      <motion.div
        animate={{
          opacity: isCardRevealed ? 1 : 0,
        }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`absolute inset-0 w-full min-h-[100dvh] flex flex-col items-center justify-center ${
          isCardRevealed ? 'z-20 pointer-events-auto' : 'z-0 pointer-events-none'
        }`}
      >
        <InvitationCard
          onOpenVideo={onOpenVideoModal}
          onReplay={handleReplay}
          mainPhrase={mainPhrase}
          secondaryText={secondaryText}
          date={date}
          countdownTargetDate={countdownTargetDate}
          buttonText={buttonText}
          replayButtonText={replayButtonText}
          isRevealed={isCardRevealed}
        />
      </motion.div>
    </div>
  );
};

export default VideoEnvelopeIntro;
