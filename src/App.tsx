import { useState, useEffect } from 'react';
import { VideoEnvelopeIntro } from './components/Envelope/VideoEnvelopeIntro';
import { FrameSequenceEnvelope } from './components/Envelope/FrameSequenceEnvelope';
import { GatefoldEnvelope, type AnimationStage } from './components/Envelope/GatefoldEnvelope';
import { VideoModal } from './components/Modal/VideoModal';
import { PasscodeGate } from './components/PasscodeGate/PasscodeGate';
import { FormalInvitationView } from './components/FormalInvitation/FormalInvitationView';
import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { FamilyInvitationView } from './components/FamilyInvitation/FamilyInvitationView';
import { invitationConfig } from './config/invitation';
import { adminLogin, isAdminAuthenticated } from './lib/api';

export function App() {
  // Simple browser history routing
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const raw = window.location.pathname.replace(/\/$/, '');
    return raw || '/';
  });

  // Admin auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => isAdminAuthenticated());
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // Formal invitation passcode unlock state (saved in sessionStorage)
  const [isFormalUnlocked, setIsFormalUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('formal_invitation_unlocked') === 'true';
  });

  const [animationStage, setAnimationStage] = useState<AnimationStage>('closed');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [hasWatchedVideo, setHasWatchedVideo] = useState<boolean>(false);

  const { theme, intro, buttonText, mainPhrase, secondaryText, date, countdownTargetDate, options } = invitationConfig;
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

  const handleAdminLoginSubmit = async (password: string) => {
    setAdminLoginLoading(true);
    setAdminLoginError(null);
    try {
      await adminLogin(password);
      setIsAdminLoggedIn(true);
    } catch (err: any) {
      setAdminLoginError(err?.message || 'Contraseña incorrecta');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  // Route matches
  const isAdminRoute = currentPath === '/admin';
  const invitationMatch = currentPath.match(/^\/invitacion\/([^/]+)$/);
  const invitationToken = invitationMatch ? invitationMatch[1] : null;
  const isSaveTheDateRoute = currentPath === '/save-the-date';

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

  // Render Admin Route
  if (isAdminRoute) {
    return isAdminLoggedIn ? (
      <AdminDashboard onLogout={() => setIsAdminLoggedIn(false)} />
    ) : (
      <AdminLogin
        onLogin={handleAdminLoginSubmit}
        isLoading={adminLoginLoading}
        error={adminLoginError}
      />
    );
  }

  // Render Family Personalized Invitation Route
  if (invitationToken) {
    return (
      <div style={rootStyle} className="min-h-[100dvh] w-full fine-paper-texture">
        <FamilyInvitationView
          token={invitationToken}
          onNavigateHome={() => navigate('/save-the-date')}
        />
      </div>
    );
  }

  return (
    <div
      style={rootStyle}
      className="relative min-h-[100dvh] w-full flex items-center justify-center paper-texture overflow-hidden selection:bg-[#4A3228] selection:text-[#F5EBE1]"
    >
      {/* Route Branch 1: /save-the-date */}
      {isSaveTheDateRoute ? (
        <>
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
            <PasscodeGate onUnlock={handleUnlockFormal} />
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
