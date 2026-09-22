import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { InvitationCard } from '../InvitationCard/InvitationCard';

export interface VideoEnvelopeIntroProps {
  /** Video source URL or public file path (default: '/intro-envelope.mp4') */
  videoSrc?: string;
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
  onOpenVideoModal,
  buttonText = 'Ver video',
  mainPhrase = 'NOS CASAMOS',
  date,
  replayButtonText = 'Volver a ver apertura',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCardRevealed, setIsCardRevealed] = useState<boolean>(false);
  const [isBlooming, setIsBlooming] = useState<boolean>(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState<boolean>(false);

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

  // Enforce muted & attempt initial autoplay on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsAutoplayBlocked(false);
          setIsPlaying(true);
        })
        .catch((error) => {
          // Autoplay policy or Low Power Mode blocked initial playback
          console.warn('Intro video autoplay prevented by browser:', error);
          setIsAutoplayBlocked(true);
          setIsPlaying(false);
        });
    }

    return () => {
      clearTimeouts();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [videoSrc, clearTimeouts]);

  // Start playback upon user interaction if autoplay was blocked
  const handleStartPlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    video
      .play()
      .then(() => {
        setIsAutoplayBlocked(false);
        setIsPlaying(true);
      })
      .catch((error) => {
        console.error('Manual video playback error:', error);
      });
  };

  // Replay intro video: resets video to 0s, clears transition, and plays again
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

      const video = videoRef.current;
      if (!video) return;

      video.currentTime = 0;
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsAutoplayBlocked(false);
        })
        .catch((error) => {
          console.warn('Replay playback error:', error);
        });
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
        className="relative w-full aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_-10px_rgba(40,30,20,0.28),0_0_24px_rgba(110,65,56,0.15)] border border-[#6E4138]/25 bg-[#FAF8F3] flex items-center justify-center select-none"
        onClick={isAutoplayBlocked ? handleStartPlayback : undefined}
      >
        {/* Video Player: Always mounted to avoid reload latencies upon replay */}
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          playsInline
          controls={false}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => {
            setIsPlaying(true);
            setIsAutoplayBlocked(false);
          }}
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

        {/* Error / Autoplay-block Fallback: "Tocar para abrir" prompt */}
        <AnimatePresence>
          {isAutoplayBlocked && !isPlaying && !isCardRevealed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/45 backdrop-blur-[3px] cursor-pointer"
              onClick={handleStartPlayback}
            >
              <motion.div
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="flex flex-col items-center gap-3.5 px-6 py-6 rounded-2xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EF] to-[#F3ECE1] border border-[#C49746]/70 shadow-[0_16px_36px_rgba(0,0,0,0.4),0_0_24px_rgba(196,151,70,0.25)] text-center cursor-pointer"
              >
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#E7CB93] via-[#C49746] to-[#8A651D] flex items-center justify-center text-[#FFFDF9] shadow-[0_4px_16px_rgba(196,151,70,0.45)]">
                  <Play className="w-6 h-6 fill-current ml-0.5 text-white" />
                  <span className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-35" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl text-[#2C2A29] font-normal tracking-wide">
                    Tocar para abrir
                  </h3>
                  <p className="mt-1 text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.22em] text-[#8A6A32] font-medium">
                    Invitación de boda
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoEnvelopeIntro;
