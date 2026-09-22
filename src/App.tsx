import { useState } from 'react';
import { GatefoldEnvelope, type AnimationStage } from './components/Envelope/GatefoldEnvelope';
import { VideoModal } from './components/Modal/VideoModal';
import { invitationConfig } from './config/invitation';

export function App() {
  const [animationStage, setAnimationStage] = useState<AnimationStage>('closed');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center p-3 sm:p-6 paper-texture overflow-x-hidden selection:bg-[#E8DCC4]">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#F3E7D3]/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] rounded-full bg-[#EBD8BC]/30 blur-[130px]" />
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
