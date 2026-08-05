import React, { useState } from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8 sm:w-10 sm:h-10 shrink-0" }) => {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img 
        src="/logo.png" 
        alt="Nahid Kutir Logo" 
        className={`${className} object-contain`} 
        onError={() => setImgError(true)} 
      />
    );
  }

  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M 100 180 C 40 180, 20 120, 20 90 C 20 50, 50 30, 80 20" stroke="#1c3e3a" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M 100 20 C 160 20, 180 80, 180 110 C 180 150, 150 170, 120 180" stroke="#d59d57" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M 30 110 C 20 100, 15 90, 30 90 C 40 90, 45 100, 30 110" fill="#698574" stroke="#1c3e3a" strokeWidth="3" />
    <path d="M 25 70 C 10 65, 10 50, 30 50 C 45 50, 45 65, 25 70" fill="#d59d57" stroke="#1c3e3a" strokeWidth="3" />
    <path d="M 60 40 C 45 30, 50 15, 70 15 C 85 15, 80 30, 60 40" fill="#698574" stroke="#1c3e3a" strokeWidth="3" />
    <path d="M 170 90 C 180 100, 185 110, 170 110 C 160 110, 155 100, 170 90" fill="#d59d57" stroke="#1c3e3a" strokeWidth="3" />
    <path d="M 175 130 C 190 135, 190 150, 170 150 C 155 150, 155 135, 175 130" fill="#698574" stroke="#1c3e3a" strokeWidth="3" />
    <rect x="80" y="55" width="12" height="25" fill="#e8e4db" stroke="#1c3e3a" strokeWidth="4" strokeLinejoin="round" />
    <path d="M 85 50 C 75 40, 95 30, 85 20" stroke="#d59d57" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M 50 145 L 50 85 L 100 85 L 100 145 Z" fill="#fcf9f2" stroke="#1c3e3a" strokeWidth="4" strokeLinejoin="round" />
    <path d="M 100 145 L 100 70 L 150 110 L 150 145 Z" fill="#fcf9f2" stroke="#1c3e3a" strokeWidth="4" strokeLinejoin="round" />
    <path d="M 40 85 L 105 85 L 105 60 Z" fill="#c3593b" stroke="#1c3e3a" strokeWidth="4" strokeLinejoin="round" />
    <path d="M 105 60 L 40 85 L 110 140 L 160 110 Z" fill="#c3593b" stroke="#1c3e3a" strokeWidth="4" strokeLinejoin="round" />
    <line x1="60" y1="78" x2="80" y2="70" stroke="#1c3e3a" strokeWidth="3" strokeLinecap="round" />
    <line x1="85" y1="68" x2="105" y2="60" stroke="#1c3e3a" strokeWidth="3" strokeLinecap="round" />
    <line x1="60" y1="95" x2="115" y2="135" stroke="#1c3e3a" strokeWidth="3" strokeLinecap="round" />
    <line x1="80" y1="88" x2="135" y2="128" stroke="#1c3e3a" strokeWidth="3" strokeLinecap="round" />
    <rect x="65" y="105" width="20" height="20" fill="#e8e4db" stroke="#1c3e3a" strokeWidth="4" strokeLinejoin="round" />
    <line x1="75" y1="105" x2="75" y2="125" stroke="#1c3e3a" strokeWidth="3" />
    <line x1="65" y1="115" x2="85" y2="115" stroke="#1c3e3a" strokeWidth="3" />
    <path d="M 115 145 L 115 115 C 115 105, 135 105, 135 115 L 135 145 Z" fill="#d59d57" stroke="#1c3e3a" strokeWidth="4" strokeLinejoin="round" />
    <path d="M 30 145 C 70 145, 90 160, 130 160 C 150 160, 160 155, 170 145" stroke="#1c3e3a" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M 40 155 C 80 155, 100 170, 140 170 C 150 170, 160 165, 165 160" stroke="#d59d57" strokeWidth="3" strokeLinecap="round" fill="none" />
  </svg>
);
};
