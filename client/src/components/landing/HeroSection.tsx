import React from 'react';

interface HeroSectionProps {
  onStartFree: () => void;
  onBookDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartFree, onBookDemo }) => {
  return (
    <section className="text-center mt-16 sm:mt-24 mb-16 max-w-4xl mx-auto">
      <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
        Financial clarity today <br className="hidden sm:inline" />
        <span className="bg-clip-text text-transparent bg-linear-to-r from-slate-900 via-slate-800 to-indigo-900">
          growth tomorrow
        </span>
      </h1>

      <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        DummyCrp Is A Lightweight Order & Settlement Platform For Modern Businesses To Track Orders, Process Payments, And Manage Balances.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          onClick={onStartFree} 
          className="w-full sm:w-auto bg-slate-900 text-white font-semibold px-7 py-3.5 rounded-full shadow-lg hover:bg-slate-800 hover:shadow-xl active:scale-95 transition flex items-center justify-center gap-2 group"
        >
          Start For Free
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <button 
          onClick={onBookDemo} 
          className="w-full sm:w-auto bg-white/90 backdrop-blur-sm text-slate-800 font-semibold px-7 py-3.5 rounded-full border border-slate-200/80 shadow-sm hover:bg-white hover:border-slate-300 hover:shadow active:scale-95 transition"
        >
          Book A Demo
        </button>
      </div>
    </section>
  );
};
