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
        viewBox="0 0 260 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-52 sm:w-60 h-auto stroke-current ${className}`}
        style={style}
        aria-hidden="true"
      >
        {/* Soft gradient definition for fading branch tips */}
        <defs>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Central delicate botanical cluster & buds */}
        <circle cx="130" cy="18" r="1.8" fill="currentColor" fillOpacity="0.75" />
        <circle cx="123" cy="17" r="1.2" fill="currentColor" fillOpacity="0.55" />
        <circle cx="137" cy="17" r="1.2" fill="currentColor" fillOpacity="0.55" />

        {/* Left branch with airy eucalyptus / olive foliage */}
        <path
          d="M124 18C106 18 90 13.5 70 17.5C52 21 34 19 16 22.5"
          strokeWidth="0.65"
          strokeLinecap="round"
        />
        {/* Left leaves */}
        <path
          d="M112 17.5C106 12 98 11.5 93 14.5C97 17.5 104 18.5 112 17.5Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.09"
        />
        <path
          d="M97 18C94 22 88 23.5 84 22C86 19 91 18 97 18Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <path
          d="M78 15.5C71 11 62 11.5 57 15C63 17.5 71 18 78 15.5Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.09"
        />
        <path
          d="M62 18.5C58 22 51 22.5 47 20.5C50 18.5 56 18 62 18.5Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <path
          d="M42 19C36 15.5 28 16.5 24 19.5C29 21.5 36 21 42 19Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.09"
        />

        {/* Left micro bud accents */}
        <path d="M89 16L86 13" strokeWidth="0.5" strokeLinecap="round" />
        <circle cx="85.5" cy="12.5" r="1.1" fill="currentColor" fillOpacity="0.6" />
        <path d="M53 19L51 22" strokeWidth="0.5" strokeLinecap="round" />
        <circle cx="50.5" cy="22.5" r="1" fill="currentColor" fillOpacity="0.5" />

        {/* Right branch with airy eucalyptus / olive foliage (symmetrical) */}
        <path
          d="M136 18C154 18 170 13.5 190 17.5C208 21 226 19 244 22.5"
          strokeWidth="0.65"
          strokeLinecap="round"
        />
        {/* Right leaves */}
        <path
          d="M148 17.5C154 12 162 11.5 167 14.5C163 17.5 156 18.5 148 17.5Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.09"
        />
        <path
          d="M163 18C166 22 172 23.5 176 22C174 19 169 18 163 18Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <path
          d="M182 15.5C189 11 198 11.5 203 15C197 17.5 189 18 182 15.5Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.09"
        />
        <path
          d="M198 18.5C202 22 209 22.5 213 20.5C210 18.5 204 18 198 18.5Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <path
          d="M218 19C224 15.5 232 16.5 236 19.5C231 21.5 224 21 218 19Z"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.09"
        />

        {/* Right micro bud accents */}
        <path d="M171 16L174 13" strokeWidth="0.5" strokeLinecap="round" />
        <circle cx="174.5" cy="12.5" r="1.1" fill="currentColor" fillOpacity="0.6" />
        <path d="M207 19L209 22" strokeWidth="0.5" strokeLinecap="round" />
        <circle cx="209.5" cy="22.5" r="1" fill="currentColor" fillOpacity="0.5" />
      </svg>
    );
  }

  if (variant === 'bottom') {
    return (
      <svg
        viewBox="0 0 200 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-36 sm:w-44 h-auto stroke-current ${className}`}
        style={style}
        aria-hidden="true"
      >
        <circle cx="100" cy="12" r="1.5" fill="currentColor" fillOpacity="0.75" />
        {/* Soft whisper curving stems */}
        <path
          d="M96 12C80 12 68 15 48 12.5C36 11 24 13 14 14.5"
          strokeWidth="0.65"
          strokeLinecap="round"
        />
        <path
          d="M104 12C120 12 132 15 152 12.5C164 11 176 13 186 14.5"
          strokeWidth="0.65"
          strokeLinecap="round"
        />

        {/* Tender whispered leaflets */}
        <path
          d="M74 12.5C69 9.5 63 10 59 12.5C63 14 69 14.5 74 12.5Z"
          strokeWidth="0.55"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <path
          d="M126 12.5C131 9.5 137 10 141 12.5C137 14 131 14.5 126 12.5Z"
          strokeWidth="0.55"
          fill="currentColor"
          fillOpacity="0.08"
        />
      </svg>
    );
  }

  // Divider: Minimalist 0.5px line with a miniature centered diamond and tender leaves
  return (
    <svg
      viewBox="0 0 240 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-44 sm:w-56 h-auto stroke-current ${className}`}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="divLineLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="divLineRight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Hairline 0.5px lines */}
      <line x1="16" y1="10" x2="104" y2="10" stroke="url(#divLineLeft)" strokeWidth="0.5" />
      <line x1="136" y1="10" x2="224" y2="10" stroke="url(#divLineRight)" strokeWidth="0.5" />

      {/* Left tender leaf beside diamond */}
      <path
        d="M108 10C111 8 114 8.5 115 10C114 11 111 11.5 108 10Z"
        strokeWidth="0.5"
        fill="currentColor"
        fillOpacity="0.12"
      />

      {/* Miniature centered diamond */}
      <path
        d="M120 7L123 10L120 13L117 10Z"
        strokeWidth="0.6"
        fill="currentColor"
        fillOpacity="0.35"
      />

      {/* Right tender leaf beside diamond */}
      <path
        d="M132 10C129 8 126 8.5 125 10C126 11 129 11.5 132 10Z"
        strokeWidth="0.5"
        fill="currentColor"
        fillOpacity="0.12"
      />
    </svg>
  );
};
