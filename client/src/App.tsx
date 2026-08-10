import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { DashboardPreview } from './components/dashboard/DashboardPreview';
import { FeaturesSection } from './components/landing/FeaturesSection';
import { AuthPage } from './components/auth/AuthPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { Toast } from './components/ui/Toast';
import { getStoredUser, logoutUser } from './services/auth.service';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'dashboard'>('landing');
  const [userEmail, setUserEmail] = useState<string>('admin@dummypay.com');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUserEmail(storedUser.email);
    }
  }, []);

  const handleAction = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setCurrentView(mode);
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
  };

  const handleAuthSuccess = (email: string) => {
    setUserEmail(email);
    setCurrentView('dashboard');
    handleAction(`Signed in successfully as ${email}!`);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentView('landing');
    handleAction('Signed out successfully.');
  };

  if (currentView === 'login' || currentView === 'register') {
    return (
      <AuthPage
        initialMode={currentView}
        onBackToHome={handleBackToHome}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (currentView === 'dashboard') {
    return (
      <DashboardView
        userEmail={userEmail}
        onLogout={handleLogout}
        onNavigateHome={handleBackToHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white relative overflow-x-hidden">
      
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Decorative Sky & Soft Ambient Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 h-200 bg-linear-to-b from-sky-200/70 via-sky-100/40 to-transparent" />
        <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-225 h-125 bg-sky-300/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-50 -left-25 w-96 h-96 bg-purple-300/20 blur-[100px] rounded-full" />
        <div className="absolute top-75 -right-25 w-96 h-96 bg-emerald-200/30 blur-[100px] rounded-full" />
      </div>

      {/* Page Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        
        {/* Navigation Bar */}
        <Navbar 
          onActionClick={(action) => {
            if (action === "Dashboard Access") {
              setCurrentView('dashboard');
            } else {
              handleAction(action);
            }
          }} 
          onOpenAuth={handleOpenAuth} 
        />

        {/* Hero Banner Section */}
        <HeroSection 
          onStartFree={() => handleOpenAuth('register')} 
          onBookDemo={() => handleOpenAuth('register')} 
        />

        {/* Floating Glass Dashboard Preview */}
        <div className="relative">
          <DashboardPreview onActionClick={handleAction} />
          
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-full shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>🚀 Launch Full Interactive Dashboard App</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* System Features Section */}
        <FeaturesSection />

      </div>
    </div>
  );
};
