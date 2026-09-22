import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Sparkles } from 'lucide-react';

export interface VideoEnvelopeIntroProps {
  /** Video source URL or public file path (default: '/intro-envelope.mp4') */
  videoSrc?: string;
  /** Callback fired when user clicks the primary action button to open the video modal */
  onOpenVideoModal: () => void;
  /** Primary button label */
  buttonText?: string;
}

export const VideoEnvelopeIntro: React.FC<VideoEnvelopeIntroProps> = ({
  videoSrc = '/intro-envelope.mp4',
  onOpenVideoModal,
  buttonText = 'Ver video',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState<boolean>(false);

  // Enforce muted & attempt initial autoplay on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Direct DOM property enforcement for iOS/WebKit autoplay compliance
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
  }, [videoSrc]);

  // Start playback upon user interaction
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

  // When video reaches end: pause on last frame and show interactive reveal actions
  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsEnded(true);
    setIsPlaying(false);
  };

  // Replay intro video anytime
  const handleReplay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    setIsEnded(false);
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
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center px-3 sm:px-4">
      {/* 
        Mobile-first vertical layout:
        Strict 9:16 aspect ratio fitting inside viewport with zero overflow:
        Max width is clamped by min(420px, 86dvh * 9/16)
      */}
      <div
        style={{
          aspectRatio: '9 / 16',
          maxWidth: 'min(420px, calc(86dvh * 9 / 16))',
        }}
        className="relative w-full aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_-10px_rgba(40,30,20,0.28),0_0_24px_rgba(196,151,70,0.18)] border border-[#C49746]/40 bg-[#161412] flex items-center justify-center select-none"
        onClick={isAutoplayBlocked ? handleStartPlayback : undefined}
      >
        {/* Fine ornamental interior gold foil frame */}
        <div className="absolute inset-2 sm:inset-2.5 rounded-xl sm:rounded-2xl border border-[#C49746]/25 pointer-events-none z-10" />

        {/* Video Player */}
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          playsInline
          controls={false}
          preload="auto"
          onPlay={() => {
            setIsPlaying(true);
            setIsAutoplayBlocked(false);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          className="w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Error / Autoplay-block Fallback: "Tocar para abrir" prompt */}
        <AnimatePresence>
          {isAutoplayBlocked && !isPlaying && !isEnded && (
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

        {/* 
          Revealed Interactive Actions when Video Ends:
          Pauses and holds seamlessly on the final frame while controls fade in
        */}
        <AnimatePresence>
          {isEnded && (
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 pb-7 pt-20 px-4 z-20 flex flex-col items-center gap-3.5 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-auto"
            >
              {/* Primary Action Button: Luxury Gold Jewel Button */}
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVideoModal();
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-[#F1E7D5] border border-[#C49746]/70 text-[#6B4F1A] shadow-[0_6px_24px_rgba(180,140,80,0.3)] hover:shadow-[0_10px_32px_rgba(180,140,80,0.45)] hover:border-[#B38734] hover:text-[#523B0F] uppercase tracking-[0.22em] text-xs sm:text-[13px] font-sans font-medium transition-all duration-300 focus:outline-none cursor-pointer overflow-hidden"
                aria-label={buttonText}
              >
                {/* Continuous sweeping soft golden sheen */}
                <motion.span
                  initial={{ x: '-140%', opacity: 0 }}
                  animate={{
                    x: ['-140%', '180%'],
                    opacity: [0, 0.75, 0],
                  }}
                  transition={{
                    delay: 0.4,
                    duration: 1.6,
                    repeat: Infinity,
                    repeatDelay: 3.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12 pointer-events-none"
                />

                <span className="absolute inset-0 rounded-full bg-[#C49746]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Play className="w-3.5 h-3.5 fill-[#C49746] text-[#C49746] transition-transform duration-300 group-hover:scale-110" />
                <span>{buttonText}</span>
                <Sparkles className="w-3.5 h-3.5 text-[#C49746]/80 group-hover:text-[#C49746] transition-colors duration-300" />
              </motion.button>

              {/* Discreet Replay Button */}
              <motion.button
                type="button"
                onClick={handleReplay}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#E5CA96] hover:text-[#FFFDF9] bg-black/35 hover:bg-black/55 border border-[#C49746]/35 hover:border-[#C49746]/65 transition-all duration-200 tracking-wider uppercase font-medium focus:outline-none focus:ring-1 focus:ring-[#C49746] cursor-pointer backdrop-blur-sm"
                title="Volver a reproducir la apertura"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#C49746]" />
                <span>Repetir</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
