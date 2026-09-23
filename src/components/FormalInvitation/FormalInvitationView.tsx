import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { GatefoldEnvelope, type AnimationStage } from '../Envelope/GatefoldEnvelope';

export interface FormalInvitationViewProps {
  onLock: () => void;
  onNavigateToSaveTheDate: () => void;
  onOpenVideoModal?: () => void;
}

export const FormalInvitationView: React.FC<FormalInvitationViewProps> = ({
  onLock,
  onNavigateToSaveTheDate,
  onOpenVideoModal = () => {},
}) => {
  const [stage, setStage] = useState<AnimationStage>('closed');

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center py-6 px-4">
      {/* Top Bar with Lock and Save the Date navigation */}
      <div className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={onNavigateToSaveTheDate}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 border border-white/60 backdrop-blur-md text-[#3E2723] hover:bg-white/60 text-xs font-sans font-medium uppercase tracking-wider transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Save the Date</span>
        </button>

        <button
          type="button"
          onClick={onLock}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 border border-white/60 backdrop-blur-md text-[#3E2723] hover:bg-white/60 text-xs font-sans font-medium uppercase tracking-wider transition-all cursor-pointer shadow-xs"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Bloquear</span>
        </button>
      </div>

      {/* Main Gatefold 3D Envelope Experience */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col items-center"
      >
        <GatefoldEnvelope
          stage={stage}
          onStageChange={setStage}
          onOpenVideo={onOpenVideoModal}
        />
      </motion.div>
    </div>
  );
};

export default FormalInvitationView;
