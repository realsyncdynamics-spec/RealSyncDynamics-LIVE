import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, RefreshCw, Globe, Zap, Server, Users, Mail, ArrowRight, CheckCircle2, Building, LayoutGrid, Download } from 'lucide-react';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import { SubscriptionProvider, useSubscription } from './contexts/SubscriptionContext';
import { ThemeProvider, useTheme, accentColors } from './contexts/ThemeContext';
import { Sun, Moon, Palette } from 'lucide-react';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';

import RSDWebsite from './components/RSDWebsite';
import CreatorBook from './components/CreatorBook';
import VerificationCenter from './components/VerificationCenter';
import AISecurity from './components/AISecurity';
import InvestorPortal from './components/InvestorPortal';
import SmartWorld from './components/SmartWorld';
import GlobalSearch from './components/GlobalSearch';
import Pricing from './components/Pricing';
import AdminSetupGuide from './components/AdminSetupGuide';
import Impressum from './components/Impressum';
import Datenschutz from './components/Datenschutz';
import CookieBanner from './components/CookieBanner';
import ProtectedRoute from './components/ProtectedRoute';
import LoginModal from './components/LoginModal';
import { Lock } from 'lucide-react';

export type AppId = 'rsd' | 'solutions' | 'products' | 'about' | 'contact' | 'cb' | 'inv' | 'smart' | 'verify' | 'ai-security' | 'pricing' | 'admin-setup' | 'impressum' | 'datenschutz';

export default function App() {
  return (
    <ErrorBoundary>
      <TranslationProvider>
        <Toaster position="top-right" theme="dark" richColors />
        <FirebaseProvider>
          <SubscriptionProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </SubscriptionProvider>
        </FirebaseProvider>
      </TranslationProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const [currentApp, setCurrentApp] = useState<AppId>('rsd');
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState('');
  const { t, language, setLanguage } = useTranslation();
  const { user, profile, login, logout, loading: authLoading, isLoginModalOpen, setIsLoginModalOpen } = useFirebase();
  const { verifySession } = useSubscription();
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const [showAccentPicker, setShowAccentPicker] = useState(false);

  useEffect(() => {
    // Check for Stripe success redirect
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId && user) {
      verifySession(sessionId);
    }
    
    // Check for Top-Up redirect
    const topupSuccess = urlParams.get('topup_success');
    const topupCanceled = urlParams.get('topup_canceled');
    const amount = urlParams.get('amount');
    
    if (topupSuccess === 'true') {
      toast.success(`Successfully topped up €${amount}!`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (topupCanceled === 'true') {
      toast.error('Top-up was canceled.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  useEffect(() => {
    // Loading simulation
    const timer = setTimeout(() => setLoading(false), 1500);
    
    // Clock update
    const interval = setInterval(() => {
      setClock(new Date().toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const switchApp = (id: AppId) => {
    setCurrentApp(id);
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
      toast.success('App installed successfully!');
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[var(--sh-bg)] flex flex-col items-center justify-center gap-4 z-50">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--sh-e)] to-[#10b981] flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(0,212,255,0.4)]">
          <Shield className="w-8 h-8 text-[var(--sh-bg)]" />
        </div>
        <div className="font-['Fraunces'] font-black text-2xl text-[var(--sh-t1)]">RealSyncDynamics</div>
        <div className="text-xs text-[var(--sh-t3)]">{t('common.loading')}</div>
        <div className="w-44 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5 }}
            className="h-full bg-gradient-to-r from-[var(--sh-e)] to-[#10b981]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen relative z-10 overflow-hidden bg-[var(--sh-bg)] text-[var(--sh-t1)] font-['Space_Grotesk'] transition-colors duration-300">
      {/* Background Canvas Effect (Simplified) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,var(--sh-e2),transparent_70%)]" />
      </div>

      {/* Platform Nav */}
      <nav className="h-[54px] flex-shrink-0 flex items-center px-5 gap-3 bg-[var(--sh-bg)]/95 backdrop-blur-3xl border-b border-[var(--sh-border)] z-[100] relative">
        <button onClick={() => switchApp('rsd')} className="flex items-center gap-3 border-none bg-none cursor-pointer group">
          <div className="w-[34px] h-[34px] rounded-xl bg-gradient-to-br from-[var(--sh-e)] to-[#10b981] flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(0,212,255,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Shield className="w-5 h-5 text-[var(--sh-bg)]" />
          </div>
          <div className="text-left">
            <div className="font-['Fraunces'] font-black text-base leading-none tracking-tight text-[var(--sh-t1)] group-hover:text-[var(--sh-e)] transition-colors">RealSyncDynamics</div>
            <div className="text-[10px] text-[var(--sh-t3)] tracking-[1.5px] uppercase font-bold mt-0.5 group-hover:text-[var(--sh-t2)] transition-colors">EST. 2026 · {t('common.germany')}</div>
          </div>
        </button>

        <div className="hidden md:flex gap-1 flex-1 ml-4 overflow-x-auto no-scrollbar">
          <TabButton id="rsd" active={currentApp === 'rsd'} onClick={() => switchApp('rsd')} label={t('nav.start')} badge={t('nav.badges.home')} color="td-rsd" />
          <TabButton id="solutions" active={currentApp === 'solutions'} onClick={() => switchApp('solutions')} label={t('nav.solutions')} badge={t('nav.badges.saas')} color="td-solutions" />
          <TabButton id="products" active={currentApp === 'products'} onClick={() => switchApp('products')} label={t('nav.products')} badge={t('nav.badges.portfolio')} color="td-products" />
          <TabButton id="about" active={currentApp === 'about'} onClick={() => switchApp('about')} label={t('nav.about')} badge={t('nav.badges.firma')} color="td-about" />
          <TabButton id="contact" active={currentApp === 'contact'} onClick={() => switchApp('contact')} label={t('nav.contact')} badge={t('nav.badges.dialog')} color="td-contact" />
          <TabButton id="cb" active={currentApp === 'cb'} onClick={() => switchApp('cb')} label={t('nav.dashboard')} badge="Creator" color="td-cb" protected />
          <TabButton id="verify" active={currentApp === 'verify'} onClick={() => switchApp('verify')} label={t('nav.verify')} badge="Trust" color="td-verify" protected />
          <TabButton id="ai-security" active={currentApp === 'ai-security'} onClick={() => switchApp('ai-security')} label="AI Security" badge="Safety" color="td-ai-security" protected />
          {user?.email === 'realsyncdynamics@gmail.com' && (
            <TabButton id="admin-setup" active={currentApp === 'admin-setup'} onClick={() => switchApp('admin-setup')} label="Go-Live" badge="Admin" color="td-admin" protected />
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <GlobalSearch onNavigate={switchApp} />
          
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
            <button 
              onClick={() => setLanguage('de')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'de' ? 'bg-[var(--sh-e)] text-[var(--sh-bg)]' : 'text-[var(--sh-t3)] hover:text-[var(--sh-t1)]'}`}
            >
              DE
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'en' ? 'bg-[var(--sh-e)] text-[var(--sh-bg)]' : 'text-[var(--sh-t3)] hover:text-[var(--sh-t1)]'}`}
            >
              EN
            </button>
          </div>

          {showInstallBtn && (
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#00d4ff] to-[#10b981] text-[#050510] text-[10px] font-black rounded-lg hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,212,255,0.3)] animate-pulse"
            >
              <Download className="w-3 h-3" /> {t('common.install_app') || 'Install App'}
            </button>
          )}

          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
            <button 
              onClick={toggleTheme}
              className="p-1.5 rounded-md hover:bg-white/10 transition-all text-[var(--sh-t2)] hover:text-[var(--sh-t1)]"
              title={theme === 'dark' ? t('common.theme_light') : t('common.theme_dark')}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowAccentPicker(!showAccentPicker)}
                className="p-1.5 rounded-md hover:bg-white/10 transition-all text-[var(--sh-t2)] hover:text-[var(--sh-t1)]"
                title={t('common.accent_color')}
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {showAccentPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 p-2 bg-[var(--sh-surface)] border border-[var(--sh-border)] rounded-xl shadow-2xl z-[200] flex gap-1.5"
                  >
                    {accentColors.map(color => (
                      <button
                        key={color.value}
                        onClick={() => {
                          setAccentColor(color.value);
                          setShowAccentPicker(false);
                        }}
                        className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${accentColor === color.value ? 'border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: color.value }}
                        title={t(color.key || '')}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-[#6ee7b7] bg-[#10b981]/10 border border-[#10b981]/20 rounded-full px-2.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_5px_#10b981]" />
            6 {t('common.apis_live')}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => switchApp('cb')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-[var(--sh-t1)] border border-white/10 hover:bg-white/10 transition-colors"
              >
                <img src={profile?.avatar || user.photoURL || ''} alt="" className="w-4 h-4 rounded-full" />
                {profile?.name || user.displayName}
              </button>
              <button 
                onClick={logout}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-[var(--sh-t2)] border border-white/10 hover:bg-white/10 transition-colors"
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              disabled={authLoading}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[var(--sh-e)] text-[var(--sh-bg)] hover:shadow-[0_0_16px_rgba(0,212,255,0.4)] transition-all disabled:opacity-50"
            >
              {authLoading ? '...' : t('common.login')}
            </button>
          )}

          <button className="hidden sm:flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-[var(--sh-t2)] border border-white/10 hover:bg-white/10 transition-colors">
            <RefreshCw className="w-3 h-3" /> {t('common.sync')}
          </button>
          <button 
            onClick={() => switchApp('cb')}
            className="px-5 py-2 rounded-xl text-[11px] font-black bg-gradient-to-br from-[var(--sh-e)] to-[var(--sh-e2)] text-[var(--sh-bg)] hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] hover:-translate-y-0.5 transition-all ring-1 ring-white/20 hover:ring-[#00d4ff]/50 uppercase tracking-wider"
          >
            {t('nav.dashboard')} →
          </button>
        </div>
      </nav>

      {/* App Container */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {['rsd', 'solutions', 'products', 'about', 'contact'].includes(currentApp) && (
            <ErrorBoundary key="rsd-site-error">
              <RSDWebsite key="rsd-site" activeSection={currentApp as any} onNavigate={switchApp} />
            </ErrorBoundary>
          )}
          {currentApp === 'cb' && (
            <ErrorBoundary key="cb-error">
              <ProtectedRoute>
                <CreatorBook />
              </ProtectedRoute>
            </ErrorBoundary>
          )}
          {currentApp === 'verify' && (
            <ErrorBoundary key="verify-error">
              <ProtectedRoute>
                <VerificationCenter />
              </ProtectedRoute>
            </ErrorBoundary>
          )}
          {currentApp === 'ai-security' && (
            <ErrorBoundary key="ai-security-error">
              <ProtectedRoute>
                <AISecurity />
              </ProtectedRoute>
            </ErrorBoundary>
          )}
          {currentApp === 'inv' && (
            <ErrorBoundary key="inv-error">
              <ProtectedRoute>
                <InvestorPortal />
              </ProtectedRoute>
            </ErrorBoundary>
          )}
          {currentApp === 'smart' && (
            <ErrorBoundary key="smart-error">
              <ProtectedRoute>
                <SmartWorld />
              </ProtectedRoute>
            </ErrorBoundary>
          )}
          {currentApp === 'pricing' && (
            <ErrorBoundary key="pricing-error">
              <Pricing onBack={() => switchApp('rsd')} />
            </ErrorBoundary>
          )}
          {currentApp === 'admin-setup' && (
            <ErrorBoundary key="admin-setup-error">
              <ProtectedRoute adminOnly>
                <AdminSetupGuide />
              </ProtectedRoute>
            </ErrorBoundary>
          )}
          {currentApp === 'impressum' && (
            <ErrorBoundary key="impressum-error">
              <Impressum onBack={() => switchApp('rsd')} />
            </ErrorBoundary>
          )}
          {currentApp === 'datenschutz' && (
            <ErrorBoundary key="datenschutz-error">
              <Datenschutz onBack={() => switchApp('rsd')} />
            </ErrorBoundary>
          )}
        </AnimatePresence>
      </main>

      {/* Status Bar */}
      <footer className="hidden md:flex h-[26px] flex-shrink-0 bg-[var(--sh-bg)]/95 border-t border-[var(--sh-border)] items-center px-5 gap-5 text-[10px] font-medium text-[var(--sh-t3)] font-mono overflow-hidden">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_4px_#10b981]" />
          YouTube
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_4px_#10b981]" />
          Instagram
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
          X ({t('common.rate_limit')})
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_4px_#10b981]" />
          SKALE Blockchain
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#534AB7]/10 border border-[#534AB7]/20 text-[#c4b5fd] cursor-pointer hover:bg-[#534AB7]/20 transition-colors">
            <Shield className="w-2.5 h-2.5" />
            {t('common.trust_score')} 84/100
          </div>
          <span className="text-[var(--sh-t3)]">{clock}</span>
        </div>
      </footer>
      <CookieBanner />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

function TabButton({ id, active, onClick, label, badge, color, protected: isProtected }: { id: string, active: boolean, onClick: () => void, label: string, badge: string, color: string, protected?: boolean }) {
  const { user } = useFirebase();
  const isLocked = isProtected && !user;

  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3.5 h-[38px] rounded-lg border text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 relative
        ${active ? 'text-[#f1f5f9] border-transparent shadow-xl' : 'bg-white/[0.02] border-white/5 text-[#94a3b8] hover:bg-white/5 hover:text-[#f1f5f9]'}
        ${active && id === 'rsd' ? 'bg-gradient-to-br from-[#00d4ff]/30 to-[#10b981]/20 border-[#00d4ff]/40 shadow-[#00d4ff]/20 backdrop-blur-md' : ''}
        ${active && id === 'solutions' ? 'bg-gradient-to-br from-[#10b981]/30 to-[#00d4ff]/20 border-[#10b981]/40 shadow-[#10b981]/20 backdrop-blur-md' : ''}
        ${active && id === 'products' ? 'bg-gradient-to-br from-[#00d4ff]/30 to-[#534AB7]/20 border-[#00d4ff]/40 shadow-[#00d4ff]/20 backdrop-blur-md' : ''}
        ${active && id === 'about' ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-white/10 backdrop-blur-md' : ''}
        ${active && id === 'contact' ? 'bg-gradient-to-br from-[#00d4ff]/30 to-white/10 border-[#00d4ff]/40 shadow-[#00d4ff]/20 backdrop-blur-md' : ''}
        ${active && id === 'cb' ? 'bg-gradient-to-br from-[#534AB7]/30 to-[#8b5cf6]/20 border-[#534AB7]/40 shadow-[#534AB7]/20 backdrop-blur-md' : ''}
        ${active && id === 'verify' ? 'bg-gradient-to-br from-[#00d4ff]/30 to-[#8b5cf6]/20 border-[#00d4ff]/40 shadow-[#00d4ff]/20 backdrop-blur-md' : ''}
        ${active && id === 'inv' ? 'bg-gradient-to-br from-[#f59e0b]/30 to-[#f43f5e]/20 border-[#f59e0b]/40 shadow-[#f59e0b]/20 backdrop-blur-md' : ''}
        ${active && id === 'smart' ? 'bg-gradient-to-br from-[#10b981]/30 to-[#00d4ff]/20 border-[#10b981]/40 shadow-[#10b981]/20 backdrop-blur-md' : ''}
        ${active && id === 'ai-security' ? 'bg-gradient-to-br from-[#f43f5e]/30 to-[#00d4ff]/20 border-[#f43f5e]/40 shadow-[#f43f5e]/20 backdrop-blur-md' : ''}
        ${active && id === 'admin-setup' ? 'bg-gradient-to-br from-[#00d4ff]/30 to-[#10b981]/20 border-[#00d4ff]/40 shadow-[#00d4ff]/20 backdrop-blur-md' : ''}
      `}
    >
      {isLocked && <Lock className="w-3 h-3 text-white/20 absolute -top-1 -right-1" />}
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'animate-pulse' : ''} ${
        ['rsd', 'verify', 'contact', 'products'].includes(id) ? 'bg-[#00d4ff]' : 
        ['solutions', 'smart'].includes(id) ? 'bg-[#10b981]' : 
        id === 'cb' ? 'bg-[#818cf8]' : 
        id === 'inv' ? 'bg-[#f59e0b]' : 
        id === 'ai-security' ? 'bg-[#f43f5e]' : 
        'bg-[#94a3b8]'
      }`} />
      {label}
      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 ${active ? 'text-[#f1f5f9]' : 'text-[#94a3b8]'}`}>{badge}</span>
    </button>
  );
}
