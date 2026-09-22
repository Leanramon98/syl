import { useState } from 'react';
import { GatefoldEnvelope, type AnimationStage } from './components/Envelope/GatefoldEnvelope';
import { VideoModal } from './components/Modal/VideoModal';
import { invitationConfig } from './config/invitation';
import { Heart } from 'lucide-react';

export function App() {
  const [animationStage, setAnimationStage] = useState<AnimationStage>('closed');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between paper-texture overflow-x-hidden selection:bg-[#E8DCC4]">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#F3E7D3]/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] rounded-full bg-[#EBD8BC]/30 blur-[130px]" />
      </div>

      {/* Top subtle brand / monogram */}
      <header className="relative z-10 w-full pt-6 pb-2 text-center select-none">
        <span className="font-serif tracking-[0.4em] uppercase text-xs text-[#9B8874] font-medium">
          {invitationConfig.couple.person1} & {invitationConfig.couple.person2}
        </span>
      </header>

      {/* Main Center Stage: Gatefold Envelope */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center py-6 sm:py-10">
        <GatefoldEnvelope
          stage={animationStage}
          onStageChange={setAnimationStage}
          onOpenVideo={() => setIsVideoModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center select-none">
        <p className="font-serif italic text-xs text-[#8C7A65] flex items-center justify-center gap-1.5">
          <span>Con amor</span>
          <Heart className="w-3 h-3 text-[#C49746] fill-current" />
          <span>{invitationConfig.date}</span>
        </p>
      </footer>

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
