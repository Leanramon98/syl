import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { VideoEnvelopeIntro } from './components/Envelope/VideoEnvelopeIntro';
import { FrameSequenceEnvelope } from './components/Envelope/FrameSequenceEnvelope';
import { GatefoldEnvelope, type AnimationStage } from './components/Envelope/GatefoldEnvelope';
import { VideoModal } from './components/Modal/VideoModal';
import { PasscodeGate } from './components/PasscodeGate/PasscodeGate';
import { FormalInvitationView } from './components/FormalInvitation/FormalInvitationView';
import { invitationConfig } from './config/invitation';

export function App() {
  // Simple browser history routing: /save-the-date vs /
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const raw = window.location.pathname.replace(/\/$/, '');
    return raw || '/';
  });

  // Formal invitation passcode unlock state (saved in sessionStorage)
  const [isFormalUnlocked, setIsFormalUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('formal_invitation_unlocked') === 'true';
  });

  const [animationStage, setAnimationStage] = useState<AnimationStage>('closed');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [hasWatchedVideo, setHasWatchedVideo] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isUserMuted, setIsUserMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const { theme, intro, buttonText, mainPhrase, secondaryText, date, countdownTargetDate, options, music } = invitationConfig;
  const isFramesIntro = intro?.type === 'frames';
  const isVideoIntro = intro?.type === 'video';

  // Sync route on browser back/forward
  useEffect(() => {
    const handleLocationChange = () => {
      const raw = window.location.pathname.replace(/\/$/, '');
      setCurrentPath(raw || '/');
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setCurrentPath(to.replace(/\/$/, '') || '/');
  };

  const handleUnlockFormal = () => {
    sessionStorage.setItem('formal_invitation_unlocked', 'true');
    setIsFormalUnlocked(true);
  };

  const handleLockFormal = () => {
    sessionStorage.removeItem('formal_invitation_unlocked');
    setIsFormalUnlocked(false);
  };

  const isSaveTheDateRoute = currentPath === '/save-the-date';

  // Coordinate background music with video modal and user muted state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isSaveTheDateRoute) {
      audio.pause();
      return;
    }

    if (isVideoModalOpen) {
      audio.pause();
    } else if (!isUserMuted) {
      audio.play().catch(() => {
        // Autoplay policy may restrict until first interaction
      });
    }
  }, [isVideoModalOpen, isUserMuted, isSaveTheDateRoute]);

  // First interaction trigger for audio on /save-the-date
  useEffect(() => {
    if (!isSaveTheDateRoute) return;

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
  }, [isUserMuted, isVideoModalOpen, isSaveTheDateRoute]);

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

      {/* 
        Route Branch 1: /save-the-date
        Renders the full Save the Date cinematic experience with countdown & music
      */}
      {isSaveTheDateRoute ? (
        <>
          {/* Sound Toggle Button */}
          <button
            type="button"
            data-music-toggle="true"
            onClick={toggleMusic}
            className="fixed top-3.5 sm:top-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 bg-white/30 border border-white/60 backdrop-blur-md shadow-xs text-[#3E2723] hover:bg-white/50 active:scale-95 transition-all cursor-pointer px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-sans tracking-wider uppercase select-none"
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

          {/* Main Stage: Video Intro / Frames Sequence */}
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
                hasWatchedVideo={hasWatchedVideo}
                replayButtonText={options.replayButtonText}
                onOpenVideoModal={() => {
                  setIsVideoModalOpen(true);
                  setHasWatchedVideo(true);
                }}
              />
            ) : (
              <GatefoldEnvelope
                stage={animationStage}
                onStageChange={setAnimationStage}
                onOpenVideo={() => setIsVideoModalOpen(true)}
              />
            )}
          </main>

          {/* Video Modal */}
          <VideoModal
            isOpen={isVideoModalOpen}
            onClose={() => setIsVideoModalOpen(false)}
            video={invitationConfig.video}
          />
        </>
      ) : (
        /*
          Route Branch 2: / (Formal Invitation Gate)
          Requires passcode until formal invitation is ready
        */
        <main className="relative z-10 w-full flex items-center justify-center">
          {!isFormalUnlocked ? (
            <PasscodeGate
              onUnlock={handleUnlockFormal}
              onNavigateToSaveTheDate={() => navigate('/save-the-date')}
            />
          ) : (
            <FormalInvitationView
              onLock={handleLockFormal}
              onNavigateToSaveTheDate={() => navigate('/save-the-date')}
              onOpenVideoModal={() => setIsVideoModalOpen(true)}
            />
          )}

          <VideoModal
            isOpen={isVideoModalOpen}
            onClose={() => setIsVideoModalOpen(false)}
            video={invitationConfig.video}
          />
        </main>
      )}
    </div>
  );
}

export default App;
