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

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  isRevealed = true,
  className = '',
}) => {
  const target = React.useMemo(() => new Date(targetDate), [targetDate]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(target));

  useEffect(() => {
    // Initial immediate calculation
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
      className={`flex items-center justify-center ${className}`}
    >
      {/* macOS Widget Style Frosted Capsule */}
      <div className="relative inline-flex items-center px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-white/60 border border-[#E6DCCE]/85 shadow-[0_4px_20px_-2px_rgba(62,41,34,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md">
        {units.map((unit, index) => (
          <React.Fragment key={unit.label}>
            {index > 0 && (
              <div className="flex flex-col items-center justify-center px-2 sm:px-3 select-none">
                <span className="text-xs sm:text-sm text-[#A89885] font-light leading-none -translate-y-1">
                  :
                </span>
              </div>
            )}
            <div className="flex flex-col items-center justify-center min-w-[36px] sm:min-w-[44px]">
              <span className="tabular-nums font-sans font-medium text-lg sm:text-xl text-[#2C1D18] tracking-tight leading-tight select-none">
                {unit.value}
              </span>
              <span className="uppercase text-[8px] sm:text-[9px] tracking-[0.2em] font-sans text-[#8D6E63] font-medium leading-none select-none mt-1">
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
