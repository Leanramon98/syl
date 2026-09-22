import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
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
  /** Wedding date string */
  date?: string;
  /** Label for replay button */
  replayButtonText?: string;
}

export const VideoEnvelopeIntro: React.FC<VideoEnvelopeIntroProps> = ({
  videoSrc = '/intro-envelope.mp4',
  autoPlayIntro = false,
  onOpenVideoModal,
  buttonText = 'Ver video',
  mainPhrase = 'NOS CASAMOS',
  date,
  replayButtonText = 'Volver a ver apertura',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(autoPlayIntro);
  const [isCardRevealed, setIsCardRevealed] = useState<boolean>(false);
  const [isBlooming, setIsBlooming] = useState<boolean>(false);

  const hasTriggeredTransition = useRef<boolean>(false);
  const transitionTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const rafRef = useRef<number | null>(null);

  // Clear pending transition timeouts
  const clearTimeouts = useCallback(() => {
    transitionTimeoutsRef.current.forEach(clearTimeout);
    transitionTimeoutsRef.current = [];
  }, []);

  // Soft optical bloom transition: opacity 0 -> 1 -> 0 over ~600ms
  // At peak (~300ms), pause video and switch seamlessly to InvitationCard
  const triggerZoomTransition = useCallback(() => {
    clearTimeouts();
    setIsBlooming(true);

    // Peak of the white bloom (~300ms): video pause & card switch
    const peakTimer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsCardRevealed(true);
    }, 300);

    // Completion of the white bloom (~600ms): dismiss bloom overlay
    const endTimer = setTimeout(() => {
      setIsBlooming(false);
    }, 600);

    transitionTimeoutsRef.current = [peakTimer, endTimer];
  }, [clearTimeouts]);

  // Video timeupdate check (guaranteed trigger at >= 5.2s)
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!hasTriggeredTransition.current && video.currentTime >= 5.2) {
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
        if (video.currentTime >= 5.2) {
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

  // Start playback upon user interaction (tapping chapita or clicking envelope)
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

  // Replay intro video: resets video to 0s, pauses, and re-shows closed envelope with chapita cue
  const handleReplay = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      clearTimeouts();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      setIsBlooming(false);
      setIsCardRevealed(false);
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

  // Handle video end fallback if reached before 5.2s
  const handleEnded = () => {
    if (!hasTriggeredTransition.current) {
      hasTriggeredTransition.current = true;
      triggerZoomTransition();
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center px-3 sm:px-4">
      {/* 
        Mobile-first vertical layout:
        Strict 9:16 aspect ratio matching the 720x1280 video and stationery card:
        Max width is clamped by min(420px, calc(86dvh * 9 / 16))
      */}
      <div
        style={{
          aspectRatio: '9 / 16',
          maxWidth: 'min(420px, calc(86dvh * 9 / 16))',
        }}
        className={`relative w-full aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_-10px_rgba(40,30,20,0.28),0_0_24px_rgba(110,65,56,0.15)] border border-[#6E4138]/25 bg-[#FAF8F3] flex items-center justify-center select-none ${
          !hasStarted && !isCardRevealed ? 'cursor-pointer' : ''
        }`}
        onClick={!hasStarted && !isCardRevealed ? handleStartPlayback : undefined}
      >
        {/* Video Player: Always mounted to avoid reload latencies upon replay */}
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
          className={`w-full h-full object-cover select-none pointer-events-none transition-opacity duration-200 ${
            isCardRevealed ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Real HTML InvitationCard: Revealed seamlessly at the peak of the white bloom */}
        {isCardRevealed && (
          <div className="absolute inset-0 w-full h-full z-20">
            <InvitationCard
              onOpenVideo={onOpenVideoModal}
              onReplay={handleReplay}
              mainPhrase={mainPhrase}
              date={date}
              buttonText={buttonText}
              replayButtonText={replayButtonText}
              isRevealed={isCardRevealed}
            />
          </div>
        )}

        {/* Smooth White Transition: Soft optical bloom overlay (opacity 0 -> 1 -> 0 over ~600ms) */}
        <AnimatePresence>
          {isBlooming && (
            <motion.div
              key="optical-bloom-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.6,
                times: [0, 0.45, 0.55, 1],
                ease: 'easeInOut',
              }}
              className="absolute inset-0 z-40 pointer-events-none bg-white"
            />
          )}
        </AnimatePresence>

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
                  {/* Subtle pulsing golden radar / ripple ring */}
                  <span
                    className="absolute inset-0 rounded-full border border-[#C49746] animate-ping opacity-40 pointer-events-none"
                    style={{ animationDuration: '2.5s' }}
                  />
                  <span
                    className="absolute -inset-2 rounded-full border border-[#C49746]/40 animate-pulse pointer-events-none"
                    style={{ animationDuration: '2s' }}
                  />

                  {/* Soft glowing halo */}
                  <span className="absolute -inset-3 rounded-full bg-[#C49746]/20 blur-md pointer-events-none animate-pulse" />

                  {/* Soft golden shimmer or breathing glow on the seal */}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#C49746]/15 via-[#F3E5C8]/25 to-[#C49746]/10 shadow-[inset_0_0_15px_rgba(196,151,70,0.35)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 pointer-events-none" />
                </button>

                {/* Delicate floating luxury badge right below the chapita */}
                <div className="absolute top-[calc(100%+14px)] flex items-center justify-center pointer-events-none whitespace-nowrap">
                  <div className="uppercase text-[10px] tracking-[0.25em] text-[#F3E5C8] font-sans font-medium px-4 py-1.5 rounded-full bg-black/60 border border-[#C49746]/50 shadow-lg backdrop-blur-md flex items-center gap-1.5 select-none pointer-events-none">
                    <Sparkles className="w-3 h-3 text-[#E7CB93] animate-pulse" />
                    <span>Tocar para abrir</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoEnvelopeIntro;
