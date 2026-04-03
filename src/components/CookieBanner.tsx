import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Shield, Settings, Check } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('rsd_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    localStorage.setItem('rsd_cookie_consent', JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('rsd_cookie_consent', JSON.stringify(preferences));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-6 right-6 z-[100] max-w-4xl mx-auto"
      >
        <div className="bg-[#050510]/95 border border-white/10 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {!showSettings ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 flex items-center justify-center shrink-0">
                <Cookie className="w-8 h-8 text-[#00d4ff]" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">We value your privacy</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Settings
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-8 py-3 rounded-xl bg-[#00d4ff] text-black font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[#00d4ff]" />
                  <h3 className="text-xl font-bold">Privacy Settings</h3>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="grid gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold">Essential Cookies</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">Required for the site to function</p>
                  </div>
                  <div className="w-10 h-6 bg-[#00d4ff]/20 rounded-full flex items-center px-1 opacity-50 cursor-not-allowed">
                    <div className="w-4 h-4 bg-[#00d4ff] rounded-full translate-x-4" />
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold">Analytics Cookies</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">Help us improve our services</p>
                  </div>
                  <button 
                    onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-all ${preferences.analytics ? 'bg-[#00d4ff]' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      animate={{ x: preferences.analytics ? 16 : 0 }}
                      className={`w-4 h-4 rounded-full ${preferences.analytics ? 'bg-black' : 'bg-white/40'}`} 
                    />
                  </button>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold">Marketing Cookies</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">Personalized ads and social media</p>
                  </div>
                  <button 
                    onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-all ${preferences.marketing ? 'bg-[#00d4ff]' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      animate={{ x: preferences.marketing ? 16 : 0 }}
                      className={`w-4 h-4 rounded-full ${preferences.marketing ? 'bg-black' : 'bg-white/40'}`} 
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-8 py-3 rounded-xl bg-[#00d4ff] text-black font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
