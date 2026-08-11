import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SwipeButtonProps {
  onSwipeComplete: () => void;
  label?: string;
  successLabel?: string;
  disabled?: boolean;
  isLoading?: boolean;
  resetKey?: any;
}

export const SwipeButton: React.FC<SwipeButtonProps> = ({
  onSwipeComplete,
  label = 'Swipe to Confirm Payment',
  successLabel = 'Payment Confirmed',
  disabled = false,
  isLoading = false,
  resetKey,
}) => {
  const [dragProgress, setDragProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const progressRef = useRef(0);

  useEffect(() => {
    setDragProgress(0);
    setIsConfirmed(false);
    setIsDragging(false);
    progressRef.current = 0;
  }, [resetKey, disabled]);

  const getMaxDrag = useCallback(() => {
    if (!containerRef.current) return 240;
    return containerRef.current.getBoundingClientRect().width - 52;
  }, []);

  const updateProgress = useCallback(
    (clientX: number) => {
      if (!containerRef.current || isConfirmed || disabled || isLoading) return;
      const maxDrag = getMaxDrag();
      if (maxDrag <= 0) return;
      const delta = clientX - startXRef.current;
      const p = Math.max(0, Math.min(1, delta / maxDrag));
      progressRef.current = p;
      setDragProgress(p);
    },
    [isConfirmed, disabled, isLoading, getMaxDrag]
  );

  const endDrag = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (progressRef.current >= 0.85) {
      setDragProgress(1);
      setIsConfirmed(true);
      onSwipeComplete();
    } else {
      setDragProgress(0);
      progressRef.current = 0;
    }
  }, [isDragging, onSwipeComplete]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => updateProgress(e.clientX);
    const onMouseUp = () => endDrag();
    const onTouchMove = (e: TouchEvent) => e.touches[0] && updateProgress(e.touches[0].clientX);
    const onTouchEnd = () => endDrag();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, updateProgress, endDrag]);

  const startDrag = (clientX: number) => {
    if (disabled || isLoading || isConfirmed) return;
    setIsDragging(true);
    startXRef.current = clientX - dragProgress * getMaxDrag();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isLoading && !isConfirmed) {
      e.preventDefault();
      setDragProgress(1);
      setIsConfirmed(true);
      onSwipeComplete();
    }
  };

  const offset = dragProgress * getMaxDrag();

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      className={`relative w-full h-12 rounded-xl select-none overflow-hidden transition-colors duration-300 ${
        disabled
          ? 'bg-slate-100 border border-slate-200 cursor-not-allowed opacity-60'
          : isConfirmed
          ? 'bg-emerald-500 border border-emerald-400'
          : 'bg-slate-900 border border-slate-800'
      }`}
    >
      {/* Fill bar */}
      <div
        className="absolute top-0 left-0 bottom-0 bg-emerald-500 transition-all ease-out rounded-xl"
        style={{
          width: isConfirmed ? '100%' : `${offset + 48}px`,
          transitionDuration: isDragging ? '0ms' : '250ms',
        }}
      />

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-14">
        {isLoading ? (
          <span className="flex items-center gap-2 text-xs font-bold text-white">
            <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : isConfirmed ? (
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            {successLabel}
          </span>
        ) : (
          <span
            className={`text-xs font-semibold transition-opacity duration-200 ${disabled ? 'text-slate-400' : 'text-slate-300'}`}
            style={{ opacity: Math.max(0.15, 1 - dragProgress * 1.5) }}
          >
            {label}
          </span>
        )}
      </div>

      {/* Chevrons hint */}
      {!isConfirmed && !isLoading && !disabled && (
        <div
          className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-px pointer-events-none transition-opacity"
          style={{ opacity: Math.max(0, 1 - dragProgress * 2.5) }}
        >
          <svg className="w-3 h-3 text-slate-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          <svg className="w-3 h-3 text-slate-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </div>
      )}

      {/* Thumb handle */}
      {!isConfirmed && (
        <div
          onMouseDown={(e) => startDrag(e.clientX)}
          onTouchStart={(e) => e.touches[0] && startDrag(e.touches[0].clientX)}
          className={`absolute top-1 bottom-1 left-1 w-10 rounded-lg flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing transition-transform ease-out ${
            disabled
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-white text-slate-900 hover:bg-slate-50 active:scale-95'
          }`}
          style={{
            transform: `translateX(${offset}px)`,
            transitionProperty: isDragging ? 'none' : 'transform',
            transitionDuration: isDragging ? '0ms' : '250ms',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      )}
    </div>
  );
};
