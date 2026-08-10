import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8 sm:w-10 sm:h-10 shrink-0 object-contain rounded-sm" }) => (
  <img src="/logo.png" alt="Nahid Kutir Logo" className={className} referrerPolicy="no-referrer" />
);
