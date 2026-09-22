import React from 'react';
import { motion } from 'framer-motion';

interface WaxSealProps {
  initials?: string;
  className?: string;
  onClick?: () => void;
}

export const WaxSeal: React.FC<WaxSealProps> = ({
  initials = 'S & T',
  className = '',
  onClick,
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      animate={{
        filter: [
          'drop-shadow(0 4px 10px rgba(70,40,20,0.35))',
          'drop-shadow(0 6px 15px rgba(115,70,25,0.5))',
          'drop-shadow(0 4px 10px rgba(70,40,20,0.35))',
        ],
      }}
      transition={{
        duration: 3.4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full cursor-pointer select-none ${className}`}
      title="Sello de cera"
    >
      {/* Irregular organic wax perimeter outline */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Rich metallic antique gold wax gradient */}
          <radialGradient id="waxGradient" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#DFB972" />
            <stop offset="45%" stopColor="#BA8C3E" />
            <stop offset="85%" stopColor="#875E20" />
            <stop offset="100%" stopColor="#5C3F12" />
          </radialGradient>

          <filter id="waxRelief" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset dx="1" dy="2" result="offset" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Organic wavy rim simulating melted wax seal */}
        <path
          d="M 50,6 
             C 63,4 77,10 86,21 
             C 95,32 98,46 95,59 
             C 92,72 84,84 72,91 
             C 60,98 44,97 31,92 
             C 18,87 9,76 6,63 
             C 3,50 8,36 17,25 
             C 26,14 37,8 50,6 Z"
          fill="url(#waxGradient)"
        />

        {/* Inner pressed ridge */}
        <circle
          cx="50"
          cy="50"
          r="34"
          stroke="#F3DAA2"
          strokeWidth="1.5"
          strokeOpacity="0.6"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="32"
          stroke="#4D3511"
          strokeWidth="1.2"
          strokeOpacity="0.45"
          fill="none"
        />
      </svg>

      {/* Center Monogram Typography with pressed relief effect */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span
          className="font-serif font-bold text-sm sm:text-base tracking-widest text-[#FBF3DC] drop-shadow-[0_1px_1px_rgba(40,25,10,0.8)]"
          style={{ textShadow: '1px 1px 1px rgba(60,40,10,0.9), -0.5px -0.5px 0.5px rgba(255,245,220,0.5)' }}
        >
          {initials}
        </span>
      </div>
    </motion.div>
  );
};
