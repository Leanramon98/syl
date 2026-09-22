import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RibbonBowProps {
  isUntying: boolean;
  onUntied?: () => void;
  onClick?: () => void;
}

export const RibbonBow: React.FC<RibbonBowProps> = ({
  isUntying,
  onClick,
}) => {
  return (
    <AnimatePresence>
      {!isUntying && (
        <motion.div
          key="ribbon-wrapper"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 1.4, ease: 'easeOut' },
          }}
          onClick={onClick}
          className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-visible"
        >
          {/* Horizontal Satin Ribbon Band wrapping around the envelope */}
          <motion.div
            initial={{ scaleX: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{
              scaleX: 1.08,
              opacity: 0,
              filter: 'blur(4px)',
              transition: { duration: 1.3, ease: [0.33, 1, 0.68, 1] },
            }}
            className="absolute w-full h-11 sm:h-12 flex items-center pointer-events-auto cursor-pointer origin-center"
          >
            {/* Satin fabric texture & glossy highlights */}
            <div className="w-full h-full bg-gradient-to-r from-[#8C6425] via-[#C99E52] via-[#ECCB8E] via-[#C99E52] to-[#8C6425] shadow-[0_4px_12px_rgba(40,25,10,0.25)] flex items-center justify-between border-y border-[#FFEAAC]/40 relative">
              {/* Fine silk edge stitch lines */}
              <div className="absolute top-[2px] left-0 right-0 h-[1px] bg-white/30" />
              <div className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-black/15" />
            </div>
          </motion.div>

          {/* Central Ribbon Bow & Knot */}
          <div className="relative pointer-events-auto cursor-pointer flex items-center justify-center">
            {/* Ribbon Bow Left Loop */}
            <motion.div
              animate={{ rotate: [-3, 0, -3] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              exit={{
                x: -24,
                rotate: -15,
                opacity: 0,
                transition: { duration: 1.2, ease: [0.33, 1, 0.68, 1] },
              }}
              className="absolute -left-7 sm:-left-9 w-10 sm:w-12 h-6 sm:h-7 rounded-full bg-gradient-to-tr from-[#9B702D] via-[#DFB972] to-[#FFE5A3] shadow-md border border-[#FFE7A8]/50 transform -rotate-12 origin-right"
            />

            {/* Ribbon Bow Right Loop */}
            <motion.div
              animate={{ rotate: [3, 0, 3] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              exit={{
                x: 24,
                rotate: 15,
                opacity: 0,
                transition: { duration: 1.2, ease: [0.33, 1, 0.68, 1] },
              }}
              className="absolute -right-7 sm:-right-9 w-10 sm:w-12 h-6 sm:h-7 rounded-full bg-gradient-to-tl from-[#9B702D] via-[#DFB972] to-[#FFE5A3] shadow-md border border-[#FFE7A8]/50 transform rotate-12 origin-left"
            />

            {/* Ribbon Tail Drape Left */}
            <motion.div
              exit={{
                y: 15,
                opacity: 0,
                transition: { duration: 1.2, ease: [0.33, 1, 0.68, 1] },
              }}
              className="absolute top-4 -left-5 w-4 h-10 sm:h-12 bg-gradient-to-b from-[#BA8C3E] to-[#875E20] transform -rotate-25 shadow-sm rounded-b-sm border-r border-[#FFDE94]/40"
            />

            {/* Ribbon Tail Drape Right */}
            <motion.div
              exit={{
                y: 15,
                opacity: 0,
                transition: { duration: 1.2, ease: [0.33, 1, 0.68, 1] },
              }}
              className="absolute top-4 -right-5 w-4 h-10 sm:h-12 bg-gradient-to-b from-[#BA8C3E] to-[#875E20] transform rotate-25 shadow-sm rounded-b-sm border-l border-[#FFDE94]/40"
            />

            {/* Central Knot */}
            <motion.div
              exit={{
                scale: 1.05,
                opacity: 0,
                transition: { duration: 1.2, ease: [0.33, 1, 0.68, 1] },
              }}
              className="relative z-10 w-7 h-8 sm:w-8 sm:h-9 rounded-md bg-gradient-to-b from-[#FFE5A3] via-[#BA8C3E] to-[#785117] shadow-[0_2px_8px_rgba(40,25,10,0.35)] border border-[#FFE7A8]/60 flex items-center justify-center"
            >
              <div className="w-1.5 h-full bg-white/20 rounded-full" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
