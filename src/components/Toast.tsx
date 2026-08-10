import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const bgColors = {
    success: 'bg-emerald-600 text-white border-emerald-400/40',
    error: 'bg-rose-600 text-white border-rose-400/40',
    info: 'bg-indigo-600 text-white border-indigo-400/40',
  };

  const icons = {
    success: <i className="fi fi-sr-check-circle text-lg shrink-0" />,
    error: <i className="fi fi-sr-info text-lg shrink-0" />,
    info: <i className="fi fi-sr-info text-lg shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 no-print animate-slideUp">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-none border shadow-xl backdrop-blur-md text-xs md:text-sm font-bold max-w-sm ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <span className="flex-1">{toast.message}</span>
        <button onClick={onClose} className="opacity-80 hover:opacity-100 p-0.5">
          <i className="fi fi-sr-cross" />
        </button>
      </div>
    </div>
  );
};
