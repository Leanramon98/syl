import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface CountdownTimerProps {
  /** Target date as ISO string or timestamp */
  targetDate: string;
  /** Whether the component should animate in */
  isRevealed?: boolean;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const difference = target.getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return { days, hours, minutes, seconds, isComplete: false };
}

/**
 * Split-Flap Card Component
 * Recreates the retro split-flap mechanical clock tile in brand color #b4717a with white digits
 */
const FlipCardTile: React.FC<{ value: string }> = ({ value }) => {
  return (
    <div className="relative flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5 min-w-[50px] sm:min-w-[62px] md:min-w-[68px] rounded-lg sm:rounded-xl bg-gradient-to-b from-[#bc7781] via-[#b4717a] to-[#a25e68] border border-[#9b5660]/40 shadow-[0_4px_14px_rgba(180,113,122,0.32),0_1px_3px_rgba(0,0,0,0.18)] overflow-hidden select-none">
      {/* Top half subtle lighting reflection */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-white/12 pointer-events-none rounded-t-lg sm:rounded-t-xl" />

      {/* Center horizontal split groove */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-black/45 border-b border-white/20 pointer-events-none z-10" />

      {/* Left hinge notch */}
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-[#1e1416] rounded-r-sm shadow-inner pointer-events-none z-20" />

      {/* Right hinge notch */}
      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-[#1e1416] rounded-l-sm shadow-inner pointer-events-none z-20" />

      {/* Split-Flap Bold White Digits */}
      <span className="relative z-0 tabular-nums font-mono sm:font-sans font-bold text-2xl sm:text-3xl md:text-4xl text-white tracking-widest leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
        {value}
      </span>
    </div>
  );
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  isRevealed = true,
  className = '',
}) => {
  const target = React.useMemo(() => new Date(targetDate), [targetDate]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(target));

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(target));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);

    return () => clearInterval(interval);
  }, [target]);

  const units = [
    { label: 'DÍAS', value: String(timeLeft.days).padStart(2, '0') },
    { label: 'HS', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'MIN', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'SEG', value: String(timeLeft.seconds).padStart(2, '0') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full flex items-center justify-center ${className}`}
    >
      {/* Retro Split-Flap Display Row */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 max-w-full">
        {units.map((unit, index) => (
          <React.Fragment key={unit.label}>
            {index > 0 && (
              <div className="flex flex-col items-center justify-center -translate-y-3 select-none">
                <span className="text-base sm:text-lg text-[#b4717a] font-bold leading-none animate-pulse">
                  :
                </span>
              </div>
            )}
            <div className="flex flex-col items-center">
              <FlipCardTile value={unit.value} />
              <span className="uppercase text-[9px] sm:text-[11px] md:text-xs tracking-[0.25em] font-sans text-[#7D5A4F] font-semibold mt-2 select-none">
                {unit.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};

export default CountdownTimer;
