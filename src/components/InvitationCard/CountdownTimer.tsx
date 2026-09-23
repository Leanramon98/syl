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
      {/* Elegant Frosted Stationery Capsule */}
      <div className="w-full max-w-[320px] sm:max-w-[360px] flex items-center justify-between px-3 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-white/70 border border-[#E6DCCE]/90 shadow-[0_4px_20px_-2px_rgba(62,41,34,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md">
        {units.map((unit, index) => (
          <React.Fragment key={unit.label}>
            {index > 0 && (
              <span className="text-xs sm:text-sm text-[#A89885]/70 font-light select-none px-0.5 -translate-y-0.5">
                :
              </span>
            )}
            <div className="flex-1 flex flex-col items-center justify-center min-w-0">
              <span className="tabular-nums font-sans font-semibold text-xl sm:text-2xl text-[#2C1D18] tracking-tight leading-none select-none">
                {unit.value}
              </span>
              <span className="uppercase text-[9px] sm:text-[10px] tracking-[0.2em] font-sans text-[#b4717a] font-semibold leading-none select-none mt-2">
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
