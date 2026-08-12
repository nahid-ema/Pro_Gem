import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-9 h-9 shrink-0" }) => (
  <div className="relative flex items-center justify-center shrink-0">
    {/* 3D Orb Glow Accent */}
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-pink-400 via-rose-300 to-amber-200 shadow-[inset_2px_2px_6px_rgba(255,255,255,0.9),0_6px_20px_rgba(244,114,182,0.35)] flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105">
      <img src="/logo.png" alt="Nahid Kutir Logo" className="w-6 h-6 object-contain drop-shadow-sm" referrerPolicy="no-referrer" />
    </div>
  </div>
);

