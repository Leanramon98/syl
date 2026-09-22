import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invitationConfig } from '../../config/invitation';
import { Flap } from './Flap';
import { RibbonBow } from './RibbonBow';
import { WaxSeal } from './WaxSeal';
import { InvitationCard } from '../InvitationCard/InvitationCard';

export type AnimationStage = 'closed' | 'untying' | 'opening' | 'revealing' | 'opened';

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

  const { couple, theme, options } = invitationConfig;

  const updateStage = (newStage: AnimationStage) => {
    setInternalStage(newStage);
    onStageChange?.(newStage);
  };

  const handleStartOpening = () => {
    if (stage !== 'closed') return;
    updateStage('untying');
  };

  // Progression of the animation sequence:
  // 1. closed: contemplation beat before auto-starting (if autoPlayIntro is true)
  // 2. untying: 1.4s ribbon & wax dissolution
  // 3. opening: 1.0s doors swinging open
  // 4. revealing: 1.8s card smoothly rises forward & contents bloom
  // 5. opened: final stable interactive state
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (stage === 'closed') {
      if (options.autoPlayIntro) {
        timer = setTimeout(() => {
          updateStage('untying');
        }, options.introDelayMs);
      }
    } else if (stage === 'untying') {
      // Ribbon unties and wax gently dissolves over 1.4s
      timer = setTimeout(() => {
        updateStage('opening');
      }, 1400);
    } else if (stage === 'opening') {
      // Gatefold doors swing open outward. At 1.0s in, card begins rising
      timer = setTimeout(() => {
        updateStage('revealing');
      }, 1000);
    } else if (stage === 'revealing') {
      // Card emergence forward completes over 1.8s
      timer = setTimeout(() => {
        updateStage('opened');
      }, 1800);
    }

    return () => clearTimeout(timer);
  }, [stage, options.autoPlayIntro, options.introDelayMs]);

  const handleReplay = () => {
    updateStage('closed');
  };

  const isFlapsOpen = stage === 'opening' || stage === 'revealing' || stage === 'opened';
  const isRibbonUntied = stage !== 'closed';
  const isCardRevealed = stage === 'revealing' || stage === 'opened';

  return (
    <div className="relative w-full max-w-[440px] sm:max-w-[480px] mx-auto px-4 flex flex-col items-center justify-center min-h-[580px] sm:min-h-[620px]">
      {/* 3D Gatefold Container */}
      <div
        className={`relative w-full aspect-[4/5] sm:aspect-[3.8/5] max-h-[660px] perspective-container flex items-center justify-center ${
          stage === 'closed' ? 'cursor-pointer' : ''
        }`}
        onClick={stage === 'closed' ? handleStartOpening : undefined}
        style={{ perspective: '1400px' }}
      >
        {/* Envelope Base Tray / Interior Lining */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F4EFE6] via-[#EBE2D4] to-[#DFD4C2] shadow-luxury border border-[#D5C6B1]/80 overflow-hidden">
          {/* Hairline gold accent frame inside interior tray */}
          <div className="absolute inset-2.5 sm:inset-3.5 rounded-xl border border-[#C49746]/25 pointer-events-none" />

          {/* Subtle watermark monogram inside back tray */}
          <div className="absolute inset-0 opacity-12 flex items-center justify-center pointer-events-none">
            <span
              className="text-8xl sm:text-9xl select-none font-extralight tracking-widest"
              style={{
                fontFamily: theme.fontSerif,
                color: theme.primaryAccent,
              }}
            >
              {couple.initials}
            </span>
          </div>
        </div>

        {/* Invitation Card nestled inside / emerging forward */}
        <div
          className={`w-full z-10 ${
            stage === 'opened' ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <InvitationCard
            isRevealed={isCardRevealed}
            onOpenVideo={onOpenVideo}
            onReplay={stage === 'opened' && options.showReplayButton ? handleReplay : undefined}
          />
        </div>

        {/* Left Gatefold Flap */}
        <Flap side="left" isOpen={isFlapsOpen} isOpened={stage === 'opened'} />

        {/* Right Gatefold Flap */}
        <Flap side="right" isOpen={isFlapsOpen} isOpened={stage === 'opened'} />

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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                scale: 1.06,
                opacity: 0,
                transition: { duration: 1.1, ease: [0.25, 1, 0.5, 1] },
              }}
              onClick={handleStartOpening}
              className="absolute z-40 cursor-pointer pointer-events-auto flex flex-col items-center"
            >
              <WaxSeal initials={couple.initials} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
