import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce text-sm font-medium border border-slate-800">
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
      {message}
    </div>
  );
};
