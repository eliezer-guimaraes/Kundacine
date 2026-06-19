'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  // Dimensions
  const dims = {
    sm: { h: 'h-8', w: 'w-28', text: 'text-lg' },
    md: { h: 'h-10', w: 'w-36', text: 'text-2xl' },
    lg: { h: 'h-14', w: 'w-48', text: 'text-3xl' },
    xl: { h: 'h-20', w: 'w-64', text: 'text-5xl' },
  }[size];

  return (
    <div className={`flex items-center gap-2 select-none font-sans font-extrabold ${className}`}>
      {/* Play Icon shape reflecting the film roll from logodosite.png */}
      <svg
        className={`${dims.h} w-auto aspect-[1.1]` }
        viewBox="0 0 100 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Accent red-orange gradient #f65c41 to darker deep orange */}
          <linearGradient id="playGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7b63" />
            <stop offset="50%" stopColor="#f65c41" />
            <stop offset="100%" stopColor="#cc2d12" />
          </linearGradient>
          <linearGradient id="filmGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cc2d12" />
            <stop offset="100%" stopColor="#ee4424" />
          </linearGradient>
        </defs>

        {/* Back film strip vertical block */}
        <rect x="8" y="10" width="14" height="70" rx="2" fill="url(#filmGrad)" />
        {/* Film squares holes */}
        <rect x="12" y="16" width="6" height="6" rx="1" fill="#101010" />
        <rect x="12" y="28" width="6" height="6" rx="1" fill="#101010" />
        <rect x="12" y="40" width="6" height="6" rx="1" fill="#101010" />
        <rect x="12" y="52" width="6" height="6" rx="1" fill="#101010" />
        <rect x="12" y="64" width="6" height="6" rx="1" fill="#101010" />

        {/* Outer stylized overlapping play arrow */}
        <path
          d="M26 13.5C26 9.8 30.1 7.6 33.2 9.6L85.1 41.1C88.0 42.9 88.0 47.1 85.1 48.9L33.2 80.4C30.1 82.4 26 80.2 26 76.5V13.5Z"
          fill="url(#playGrad)"
        />
        {/* Inner negative play arrow punchout */}
        <path
          d="M38 27.5C38 25.5 40.2 24.3 41.9 25.3L69.9 42.8C71.5 43.8 71.5 46.2 69.9 47.2L41.9 64.7C40.2 65.7 38 64.5 38 62.5V27.5Z"
          fill="#101010"
        />
      </svg>

      {/* Styled logo text matching "KundaCine" in logodosite.png */}
      <span className="tracking-tight flex items-baseline">
        <span className="text-white hover:text-gray-300 transition-colors drop-shadow-sm font-semibold">
          Kunda
        </span>
        <span className="text-[#f65c41] drop-shadow-[0_2px_10px_rgba(246,92,65,0.2)]">
          Cine
        </span>
      </span>
    </div>
  );
}
