import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8 sm:w-10 sm:h-10 shrink-0" }) => (
  <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="logo-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
      <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.5"/>
      </filter>
    </defs>

    <rect width="512" height="512" rx="112" fill="url(#logo-bg)"/>
    
    <g filter="url(#logo-shadow)">
      {/* N Shape (Blue) */}
      <path d="M 146 400 L 146 180 L 256 400 L 256 180" stroke="url(#logo-blue)" fill="none" strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" />
      
      {/* K Branches (Gold) */}
      <path d="M 366 180 L 256 290 L 366 400" stroke="url(#logo-gold)" fill="none" strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Roof (Gold) */}
      <path d="M 96 170 L 256 40 L 416 170" stroke="url(#logo-gold)" fill="none" strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

