import { useState } from 'react';
import { GatefoldEnvelope, type AnimationStage } from './components/Envelope/GatefoldEnvelope';
import { VideoModal } from './components/Modal/VideoModal';
import { invitationConfig } from './config/invitation';

export function App() {
  const [animationStage, setAnimationStage] = useState<AnimationStage>('closed');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  const { theme } = invitationConfig;

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
      className="relative min-h-[100dvh] w-full flex items-center justify-center p-3 sm:p-6 paper-texture overflow-x-hidden selection:bg-[var(--theme-accent)] selection:text-white"
    >
      {/* Ambient background glows using primary theme accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-40"
          style={{ backgroundColor: `${theme.primaryAccent}33` }}
        />
        <div
          className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] rounded-full blur-[130px] opacity-30"
          style={{ backgroundColor: `${theme.primaryAccentHover}26` }}
        />
      </div>

      {/* Main Center Stage: Gatefold Envelope */}
      <main className="relative z-10 w-full flex items-center justify-center">
        <GatefoldEnvelope
          stage={animationStage}
          onStageChange={setAnimationStage}
          onOpenVideo={() => setIsVideoModalOpen(true)}
        />
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
