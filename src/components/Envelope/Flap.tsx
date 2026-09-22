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
              ? '-6px 6px 16px rgba(40, 30, 20, 0.08)'
              : '6px 6px 16px rgba(40, 30, 20, 0.08)'
            : isLeft
            ? '-14px 10px 24px rgba(40, 30, 20, 0.16)'
            : '14px 10px 24px rgba(40, 30, 20, 0.16)'
          : isLeft
          ? '4px 0 12px rgba(40, 30, 20, 0.08)'
          : '-4px 0 12px rgba(40, 30, 20, 0.08)',
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
        isLeft ? 'left-0 rounded-l-xl' : 'right-0 rounded-r-xl'
      } w-[50.5%] z-20 envelope-texture border ${
        isLeft ? 'border-r-[#DACBB6] border-y-[#E6DCce] border-l-[#E6DCce]' : 'border-l-[#DACBB6] border-y-[#E6DCce] border-r-[#E6DCce]'
      } overflow-hidden pointer-events-none select-none`}
    >
      {/* Delicate inner margin border on the flap */}
      <div
        className={`absolute inset-2 sm:inset-3 border border-[#C49746]/25 rounded-md ${
          isLeft ? 'border-r-0 mr-0' : 'border-l-0 ml-0'
        }`}
      />

      {/* Dynamic lighting: smooth shadow gradient shift simulating the opening of real paper flaps */}
      <motion.div
        animate={{
          opacity: isOpen ? 0.25 : 0.85,
        }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute inset-0 bg-gradient-to-r pointer-events-none ${
          isLeft
            ? 'from-black/[0.08] via-transparent to-black/[0.12]'
            : 'from-black/[0.12] via-transparent to-black/[0.08]'
        }`}
      />

      {/* Fold crease highlight along the spine edge */}
      <div
        className={`absolute top-0 bottom-0 ${
          isLeft ? 'left-0' : 'right-0'
        } w-[3px] bg-gradient-to-b from-white/40 via-white/20 to-transparent`}
      />

      {/* Meeting center edge subtle highlight */}
      <div
        className={`absolute top-0 bottom-0 ${
          isLeft ? 'right-0' : 'left-0'
        } w-[1px] bg-[#B09B82]/40`}
      />

      {children}
    </motion.div>
  );
};
