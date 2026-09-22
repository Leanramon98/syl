import React from 'react';
import { motion } from 'framer-motion';

interface FlapProps {
  side: 'left' | 'right';
  isOpen: boolean;
  isOpened?: boolean;
  children?: React.ReactNode;
}

export const Flap: React.FC<FlapProps> = ({ side, isOpen, isOpened = false, children }) => {
  const isLeft = side === 'left';

  return (
    <motion.div
      initial={false}
      animate={{
        rotateY: isOpen ? (isLeft ? -118 : 118) : 0,
        opacity: isOpened ? 0.45 : 1,
        boxShadow: isOpen
          ? isOpened
            ? isLeft
              ? '-4px 6px 18px rgba(50, 40, 25, 0.05)'
              : '4px 6px 18px rgba(50, 40, 25, 0.05)'
            : isLeft
            ? '-10px 8px 24px rgba(50, 40, 25, 0.08)'
            : '10px 8px 24px rgba(50, 40, 25, 0.08)'
          : isLeft
          ? '3px 0 12px rgba(50, 40, 25, 0.06)'
          : '-3px 0 12px rgba(50, 40, 25, 0.06)',
      }}
      transition={{
        rotateY: {
          duration: 1.6,
          ease: [0.22, 1, 0.36, 1], // Luxurious velvety deceleration with zero bouncing
        },
        opacity: {
          duration: 0.9,
          ease: 'easeInOut',
        },
        boxShadow: {
          duration: 1.4,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      style={{
        transformOrigin: isLeft ? 'left center' : 'right center',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
      className={`absolute top-0 bottom-0 ${
        isLeft ? 'left-0 rounded-l-2xl' : 'right-0 rounded-r-2xl'
      } w-[50.5%] z-20 envelope-texture border ${
        isLeft ? 'border-r-[#DACBB6]/80 border-y-[#E8DFCFA0] border-l-[#E8DFCFA0]' : 'border-l-[#DACBB6]/80 border-y-[#E8DFCFA0] border-r-[#E8DFCFA0]'
      } overflow-hidden pointer-events-none select-none`}
    >
      {/* Delicate inner margin border on the flap with hairline gold accents */}
      <div
        className={`absolute inset-2 sm:inset-3 border border-[#C49746]/25 rounded-lg ${
          isLeft ? 'border-r-0 mr-0' : 'border-l-0 ml-0'
        }`}
      />

      {/* Dynamic lighting: soft paper lighting */}
      <motion.div
        animate={{
          opacity: isOpen ? 0.2 : 0.8,
        }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute inset-0 bg-gradient-to-r pointer-events-none ${
          isLeft
            ? 'from-black/[0.04] via-transparent to-black/[0.06]'
            : 'from-black/[0.06] via-transparent to-black/[0.04]'
        }`}
      />

      {/* Fold crease highlight along the spine edge */}
      <div
        className={`absolute top-0 bottom-0 ${
          isLeft ? 'left-0' : 'right-0'
        } w-[3px] bg-gradient-to-b from-white/40 via-white/20 to-transparent`}
      />

      {/* Meeting center edge hairline gold accent */}
      <div
        className={`absolute top-0 bottom-0 ${
          isLeft ? 'right-0' : 'left-0'
        } w-[1px] bg-[#C49746]/35`}
      />

      {children}
    </motion.div>
  );
};
