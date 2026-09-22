import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invitationConfig } from '../../config/invitation';
import { Flap } from './Flap';
import { RibbonBow } from './RibbonBow';
import { WaxSeal } from './WaxSeal';
import { InvitationCard } from '../InvitationCard/InvitationCard';

export type AnimationStage = 'closed' | 'untying' | 'opening' | 'opened';

interface GatefoldEnvelopeProps {
  onOpenVideo: () => void;
  stage?: AnimationStage;
  onStageChange?: (newStage: AnimationStage) => void;
}

export const GatefoldEnvelope: React.FC<GatefoldEnvelopeProps> = ({
  onOpenVideo,
  stage: externalStage,
  onStageChange,
}) => {
  const [internalStage, setInternalStage] = useState<AnimationStage>('closed');
  const stage = externalStage !== undefined ? externalStage : internalStage;

  const updateStage = (newStage: AnimationStage) => {
    setInternalStage(newStage);
    onStageChange?.(newStage);
  };

  const handleStartOpening = () => {
    if (stage !== 'closed') return;
    // Step 1: Untie ribbon
    updateStage('untying');
  };

  // Progression of the animation sequence
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === 'untying') {
      // Untie duration before opening flaps
      timer = setTimeout(() => {
        updateStage('opening');
      }, 700);
    } else if (stage === 'opening') {
      // Gatefold flaps swing open before card emerges
      timer = setTimeout(() => {
        updateStage('opened');
      }, 950);
    }
    return () => clearTimeout(timer);
  }, [stage]);

  const handleReplay = () => {
    updateStage('closed');
  };

  const isFlapsOpen = stage === 'opening' || stage === 'opened';
  const isRibbonUntied = stage !== 'closed';

  return (
    <div className="relative w-full max-w-[440px] sm:max-w-[480px] mx-auto px-4 flex flex-col items-center justify-center min-h-[580px] sm:min-h-[620px]">
      {/* 3D Gatefold Container */}
      <div
        className="relative w-full aspect-[4/5] sm:aspect-[3.8/5] max-h-[660px] perspective-container flex items-center justify-center"
        style={{ perspective: '1400px' }}
      >
        {/* Envelope Base Tray / Interior Lining */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#EFE8DC] via-[#E8DFD0] to-[#DDD2C0] shadow-luxury border border-[#D5C6B1] overflow-hidden">
          {/* Subtle watermark monogram or geometric foil texture inside back tray */}
          <div className="absolute inset-0 opacity-15 flex items-center justify-center pointer-events-none">
            <span className="font-serif text-8xl sm:text-9xl text-[#B88E48] select-none font-extralight tracking-widest">
              {invitationConfig.couple.initials}
            </span>
          </div>
        </div>

        {/* Invitation Card nestled inside / emerging forward */}
        <motion.div
          animate={{
            scale: stage === 'opened' ? 1 : 0.94,
            y: stage === 'opened' ? 0 : 4,
            z: stage === 'opened' ? 40 : 0,
            opacity: stage === 'closed' ? 0.8 : 1,
          }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`w-full z-10 ${
            stage === 'opened' ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <InvitationCard
            onOpenVideo={onOpenVideo}
            onReplay={stage === 'opened' ? handleReplay : undefined}
          />
        </motion.div>

        {/* Left Gatefold Flap */}
        <Flap side="left" isOpen={isFlapsOpen} />

        {/* Right Gatefold Flap */}
        <Flap side="right" isOpen={isFlapsOpen} />

        {/* Satin Ribbon & Bow (Unties first) */}
        <RibbonBow
          isUntying={isRibbonUntied}
          onClick={handleStartOpening}
        />

        {/* Wax Seal Medallion in the center over the ribbon */}
        <AnimatePresence>
          {!isRibbonUntied && (
            <motion.div
              key="wax-seal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                scale: 1.25,
                opacity: 0,
                rotate: 8,
                transition: { duration: 0.5, ease: 'easeOut' },
              }}
              onClick={handleStartOpening}
              className="absolute z-40 cursor-pointer pointer-events-auto flex flex-col items-center"
            >
              <WaxSeal initials={invitationConfig.couple.initials} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Click Cues when closed */}
        <AnimatePresence>
          {stage === 'closed' && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onClick={handleStartOpening}
              className="absolute -bottom-14 sm:-bottom-16 z-30 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 hover:bg-white text-[#855F1E] border border-[#E0D1BB] shadow-sm backdrop-blur-sm text-xs sm:text-sm font-sans tracking-widest uppercase transition-all duration-300 hover:scale-105 cursor-pointer animate-pulse"
              aria-label={invitationConfig.envelopePrompt}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C49746]" />
              <span>{invitationConfig.envelopePrompt}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C49746]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
