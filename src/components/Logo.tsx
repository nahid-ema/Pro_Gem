import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8 sm:w-10 sm:h-10 shrink-0" }) => (
  <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="112" fill="#0f172a" />
    <g fill="none" strokeWidth={36} strokeLinecap="round" strokeLinejoin="round">
      {/* N Shape (Blue) */}
      <path d="M 146 400 L 146 180 L 256 400 L 256 180" stroke="#38bdf8" />
      {/* K Branches (Gold) */}
      <path d="M 366 180 L 256 290 L 366 400" stroke="#fbbf24" />
      {/* Roof (Gold) */}
      <path d="M 96 170 L 256 40 L 416 170" stroke="#fbbf24" />
    </g>
  </svg>
);

