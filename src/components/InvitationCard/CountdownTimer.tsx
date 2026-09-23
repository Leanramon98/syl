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
 * Split-Flap Single Digit Tile
 * Faithfully matches the reference split-flap clock:
 * - Crisp white card on both top and bottom halves (identical paper stock)
 * - Tall, condensed, bold numerals ('Bebas Neue') in dark charcoal #2B3037
 * - Hairline clean split seam without obstructive dark bars across the digits
 * - Delicate, ultra-thin silver hinge tabs that do not collide with adjacent cards
 * - Snappy 3D mechanical fold animation with subtle shading
 */
const FlipDigitTile: React.FC<{ digit: string }> = ({ digit }) => {
  const [current, setCurrent] = useState(digit);
  const [previous, setPrevious] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (digit !== current) {
      setPrevious(current);
      setCurrent(digit);
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [digit, current]);

  return (
    <div
      style={{ perspective: 450 }}
      className="relative w-7 h-11 sm:w-9 sm:h-14 md:w-10 md:h-16 rounded-[5px] sm:rounded-md shadow-[0_3px_10px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] bg-white border border-[#D5DAE0] select-none"
    >
      {/* Top Static Half (shows current settled digit) */}
      <div className="absolute top-0 inset-x-0 h-1/2 overflow-hidden rounded-t-[4px] sm:rounded-t-[5px] bg-white border-b border-black/[0.08]">
        <div className="absolute top-0 inset-x-0 h-[200%] flex items-center justify-center">
          <span
            className="text-2xl sm:text-3xl md:text-4xl text-[#2B3037] leading-none select-none tracking-tight font-normal"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {current}
          </span>
        </div>
      </div>

      {/* Bottom Static Half (shows current settled digit, or previous while flipping) */}
      <div className="absolute bottom-0 inset-x-0 h-1/2 overflow-hidden rounded-b-[4px] sm:rounded-b-[5px] bg-white">
        <div className="absolute -top-full inset-x-0 h-[200%] flex items-center justify-center">
          <span
            className="text-2xl sm:text-3xl md:text-4xl text-[#2B3037] leading-none select-none tracking-tight font-normal"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {isFlipping ? previous : current}
          </span>
        </div>
      </div>

      {/* 3D Mechanical Folding Flap */}
      {isFlipping && (
        <>
          {/* Top flap folding down & forward (0 -> -90deg) */}
          <motion.div
            key={`top-flap-${current}`}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -90 }}
            transition={{ duration: 0.18, ease: 'easeIn' }}
            style={{ transformOrigin: 'bottom', backfaceVisibility: 'hidden' }}
            className="absolute top-0 inset-x-0 h-1/2 overflow-hidden rounded-t-[4px] sm:rounded-t-[5px] bg-white border-b border-black/[0.12] z-20"
          >
            <div className="absolute top-0 inset-x-0 h-[200%] flex items-center justify-center">
              <span
                className="text-2xl sm:text-3xl md:text-4xl text-[#2B3037] leading-none select-none tracking-tight font-normal"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {previous}
              </span>
            </div>
            {/* Subtle natural shadow during downward fold */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-black pointer-events-none"
            />
          </motion.div>

          {/* Bottom flap dropping into view (90deg -> 0deg) */}
          <motion.div
            key={`bot-flap-${current}`}
            initial={{ rotateX: 90 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.2, delay: 0.18, ease: 'easeOut' }}
            style={{ transformOrigin: 'top', backfaceVisibility: 'hidden' }}
            className="absolute bottom-0 inset-x-0 h-1/2 overflow-hidden rounded-b-[4px] sm:rounded-b-[5px] bg-white z-20"
          >
            <div className="absolute -top-full inset-x-0 h-[200%] flex items-center justify-center">
              <span
                className="text-2xl sm:text-3xl md:text-4xl text-[#2B3037] leading-none select-none tracking-tight font-normal"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {current}
              </span>
            </div>
            {/* Subtle shadow clearing as it lands */}
            <motion.div
              initial={{ opacity: 0.15 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.18 }}
              className="absolute inset-0 bg-black pointer-events-none"
            />
          </motion.div>
        </>
      )}

      {/* Hairline Center Micro-Seam */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[0.5px] bg-black/[0.08] z-25 pointer-events-none" />

      {/* Delicate Side Hinge Clips (flush with card edges, silver metallic finish) */}
      <div className="absolute -left-[1.5px] top-1/2 -translate-y-1/2 w-[2.5px] sm:w-[3px] h-2 sm:h-2.5 bg-gradient-to-r from-[#BFC5CC] via-[#FFFFFF] to-[#9BA1AA] border border-[#8C929C]/50 rounded-[1px] shadow-xs z-30 pointer-events-none" />
      <div className="absolute -right-[1.5px] top-1/2 -translate-y-1/2 w-[2.5px] sm:w-[3px] h-2 sm:h-2.5 bg-gradient-to-r from-[#9BA1AA] via-[#FFFFFF] to-[#BFC5CC] border border-[#8C929C]/50 rounded-[1px] shadow-xs z-30 pointer-events-none" />
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

  // Format unit strings
  const daysStr = String(timeLeft.days).padStart(timeLeft.days >= 100 ? 3 : 2, '0');
  const hoursStr = String(timeLeft.hours).padStart(2, '0');
  const minutesStr = String(timeLeft.minutes).padStart(2, '0');
  const secondsStr = String(timeLeft.seconds).padStart(2, '0');

  const groups = [
    { label: 'DÍAS', digits: daysStr.split('') },
    { label: 'HRS', digits: hoursStr.split('') },
    { label: 'MIN', digits: minutesStr.split('') },
    { label: 'SEC', digits: secondsStr.split('') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full flex items-center justify-center ${className}`}
    >
      {/* Retro Split-Flap Clock Row matching reference image */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-3.5 max-w-full">
        {groups.map((group, groupIndex) => (
          <React.Fragment key={group.label}>
            {groupIndex > 0 && (
              <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 -translate-y-2.5 sm:-translate-y-3 px-0.5 select-none">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#4A5059] opacity-80" />
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#4A5059] opacity-80" />
              </div>
            )}
            <div className="flex flex-col items-center">
              {/* Digit cards grouped with clean spacing */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {group.digits.map((d, i) => (
                  <FlipDigitTile key={`${group.label}-${i}`} digit={d} />
                ))}
              </div>

              {/* Group label in brand coral / rose (#b4717a) */}
              <span className="uppercase text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.22em] font-sans text-[#b4717a] font-bold mt-2 sm:mt-2.5 select-none">
                {group.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};

export default CountdownTimer;
