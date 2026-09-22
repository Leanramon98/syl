import React from 'react';

interface FloralOrnamentProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: 'top' | 'bottom' | 'divider' | 'corner';
}

export const FloralOrnaments: React.FC<FloralOrnamentProps> = ({
  className = '',
  style,
  variant = 'top',
}) => {
  if (variant === 'top') {
    return (
      <svg
        viewBox="0 0 240 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-48 sm:w-56 h-auto stroke-current ${className}`}
        style={style}
        aria-hidden="true"
      >
        {/* Central delicate bud and leaves */}
        <circle cx="120" cy="18" r="2.5" fill="currentColor" fillOpacity="0.8" />
        <circle cx="112" cy="17" r="1.5" fill="currentColor" fillOpacity="0.6" />
        <circle cx="128" cy="17" r="1.5" fill="currentColor" fillOpacity="0.6" />

        {/* Left graceful branch */}
        <path
          d="M116 18C100 18 85 14 65 20C48 25 30 22 15 26"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <path
          d="M95 16.5C92 12 85 11 81 14C83 17 89 18 95 16.5Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <path
          d="M75 18C70 14 62 14 59 18C62 20 68 20.5 75 18Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <path
          d="M52 21C46 17 38 18 36 22C40 24 46 23.5 52 21Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.15"
        />

        {/* Right graceful branch (symmetric) */}
        <path
          d="M124 18C140 18 155 14 175 20C192 25 210 22 225 26"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <path
          d="M145 16.5C148 12 155 11 159 14C157 17 151 18 145 16.5Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <path
          d="M165 18C170 14 178 14 181 18C178 20 172 20.5 165 18Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <path
          d="M188 21C194 17 202 18 204 22C200 24 194 23.5 188 21Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.15"
        />
      </svg>
    );
  }

  if (variant === 'bottom') {
    return (
      <svg
        viewBox="0 0 240 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-40 sm:w-48 h-auto stroke-current ${className}`}
        style={style}
        aria-hidden="true"
      >
        <circle cx="120" cy="16" r="2" fill="currentColor" fillOpacity="0.75" />
        {/* Soft curving stem */}
        <path
          d="M116 16C95 16 80 20 50 16C35 14 20 17 10 18"
          strokeWidth="0.75"
          strokeLinecap="round"
        />
        <path
          d="M124 16C145 16 160 20 190 16C205 14 220 17 230 18"
          strokeWidth="0.75"
          strokeLinecap="round"
        />
        <path
          d="M85 17C81 13 74 13 72 16C75 18 80 18.5 85 17Z"
          strokeWidth="0.5"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <path
          d="M155 17C159 13 166 13 168 16C165 18 160 18.5 155 17Z"
          strokeWidth="0.5"
          fill="currentColor"
          fillOpacity="0.15"
        />
      </svg>
    );
  }

  // Elegant subtle line divider
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} style={style}>
      <span className="h-[0.5px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#C49746]/60 to-[#C49746]" />
      <span className="w-1.5 h-1.5 rotate-45 border border-[#C49746] bg-[#C49746]/30" />
      <span className="h-[0.5px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#C49746]/60 to-[#C49746]" />
    </div>
  );
};
