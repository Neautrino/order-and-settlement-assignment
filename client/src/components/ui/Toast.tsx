import React from 'react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border transition-all animate-in slide-in-from-bottom-5 duration-300 ${
      isError
        ? 'bg-rose-950/95 backdrop-blur-md text-rose-100 border-rose-800/80 shadow-rose-950/40'
        : 'bg-slate-900/95 backdrop-blur-md text-white border-slate-800 shadow-slate-950/40'
    }`}>
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isError ? 'bg-rose-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-white font-bold cursor-pointer"
        >
          ✕
        </button>
      )}
    </div>
  );
};
