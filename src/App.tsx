import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { GatefoldEnvelope, type AnimationStage } from './components/Envelope/GatefoldEnvelope';
import { VideoEnvelopeIntro } from './components/Envelope/VideoEnvelopeIntro';
import { FrameSequenceEnvelope } from './components/Envelope/FrameSequenceEnvelope';
import { VideoModal } from './components/Modal/VideoModal';
import { invitationConfig } from './config/invitation';

export function App() {
  const [animationStage, setAnimationStage] = useState<AnimationStage>('closed');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isUserMuted, setIsUserMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const { theme, intro, buttonText, mainPhrase, secondaryText, date, countdownTargetDate, options, music } = invitationConfig;
  const isFramesIntro = intro?.type === 'frames';
  const isVideoIntro = intro?.type === 'video';

  // Coordinate background music with video modal and user muted state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isVideoModalOpen) {
      audio.pause();
    } else if (!isUserMuted) {
      audio.play().catch(() => {
        // Autoplay policy may restrict until first interaction
      });
    }
  }, [isVideoModalOpen, isUserMuted]);

  // First interaction trigger: start audio smoothly on first interaction
  useEffect(() => {
    const handleFirstInteraction = (e: Event) => {
      if ((e.target as HTMLElement)?.closest('[data-music-toggle]')) {
        return;
      }
      if (!isUserMuted && !isVideoModalOpen && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isUserMuted, isVideoModalOpen]);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsUserMuted(true);
    } else {
      setIsUserMuted(false);
      audio.play().catch(() => {});
    }
  };

  // Injected CSS custom properties from invitationConfig.theme
  const rootStyle = {
    '--theme-accent': theme.primaryAccent,
    '--theme-accent-hover': theme.primaryAccentHover,
    '--theme-bg': theme.paperBackground,
    '--theme-card': theme.cardBackground,
    '--theme-text': theme.textPrimary,
    '--theme-text-muted': theme.textSecondary,
    '--theme-font-serif': theme.fontSerif,
    '--theme-font-sans': theme.fontSans,
    '--theme-font-script': theme.fontScript,
    backgroundColor: theme.paperBackground,
    color: theme.textPrimary,
    fontFamily: theme.fontSans,
  } as React.CSSProperties;

  return (
    <div
      style={rootStyle}
      className="relative min-h-[100dvh] w-full flex items-center justify-center paper-texture overflow-hidden selection:bg-[#4A3228] selection:text-[#F5EBE1]"
    >

      {/* Background Audio Player */}
      <audio
        ref={audioRef}
        src={music?.src || '/background-music.mp3'}
        loop={music?.loop ?? true}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Top-centered Sound Toggle Button */}
      <button
        type="button"
        data-music-toggle="true"
        onClick={toggleMusic}
        className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 bg-white/25 border border-white/50 backdrop-blur-md shadow-lg text-[#3E2723] hover:bg-white/40 active:scale-95 transition-all cursor-pointer px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-sans tracking-wider uppercase select-none"
        aria-label={isPlaying ? "Silenciar música" : "Activar música"}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-[#3E2723] animate-pulse" />
            <span>Música</span>
            <span className="flex items-end gap-0.5 h-2.5 ml-0.5" aria-hidden="true">
              <span className="w-0.5 bg-[#3E2723] h-full animate-pulse rounded-full" />
              <span className="w-0.5 bg-[#3E2723] h-1.5 animate-pulse rounded-full opacity-80" />
              <span className="w-0.5 bg-[#3E2723] h-2 animate-pulse rounded-full opacity-90" />
            </span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-[#3E2723]/70" />
            <span className="text-[#3E2723]/70">Música</span>
          </>
        )}
      </button>

      {/* Main Center Stage: Frame Sequence, Video Intro, or Gatefold Envelope */}
      <main className="relative z-10 w-full flex items-center justify-center">
        {isFramesIntro ? (
          <FrameSequenceEnvelope
            frames={intro.frames}
            mainPhrase={mainPhrase}
            date={date}
            buttonText={buttonText}
            replayButtonText={options.replayButtonText}
            onOpenVideoModal={() => setIsVideoModalOpen(true)}
          />
        ) : isVideoIntro ? (
          <VideoEnvelopeIntro
            videoSrc={intro.videoSrc}
            autoPlayIntro={options.autoPlayIntro}
            buttonText={buttonText}
            mainPhrase={mainPhrase}
            secondaryText={secondaryText}
            date={date}
            countdownTargetDate={countdownTargetDate}
            replayButtonText={options.replayButtonText}
            onOpenVideoModal={() => setIsVideoModalOpen(true)}
          />
        ) : (
          <GatefoldEnvelope
            stage={animationStage}
            onStageChange={setAnimationStage}
            onOpenVideo={() => setIsVideoModalOpen(true)}
          />
        )}
      </main>

      {/* Video Modal Player */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={invitationConfig.video}
      />
    </div>
  );
}

export default App;
