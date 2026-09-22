import { useState } from 'react';
import { GatefoldEnvelope, type AnimationStage } from './components/Envelope/GatefoldEnvelope';
import { VideoEnvelopeIntro } from './components/Envelope/VideoEnvelopeIntro';
import { FrameSequenceEnvelope } from './components/Envelope/FrameSequenceEnvelope';
import { VideoModal } from './components/Modal/VideoModal';
import { invitationConfig } from './config/invitation';

export function App() {
  const [animationStage, setAnimationStage] = useState<AnimationStage>('closed');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  const { theme, intro, buttonText, mainPhrase, date, options } = invitationConfig;
  const isFramesIntro = intro?.type === 'frames';
  const isVideoIntro = intro?.type === 'video';

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
      className="relative min-h-[100dvh] w-full flex items-center justify-center p-3 sm:p-6 paper-texture overflow-x-hidden selection:bg-[#4A3228] selection:text-[#F5EBE1]"
    >
      {/* Ambient background glows using warm theme accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-35"
          style={{ backgroundColor: `${theme.primaryAccent}26` }}
        />
        <div
          className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] rounded-full blur-[130px] opacity-25"
          style={{ backgroundColor: '#8D6E6326' }}
        />
      </div>

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
            buttonText={buttonText}
            mainPhrase={mainPhrase}
            date={date}
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
