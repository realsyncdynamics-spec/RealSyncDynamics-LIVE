import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useTranslation } from '../contexts/TranslationContext';
import { toast } from 'sonner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { t } = useTranslation();
  const { login, loginWithEmail, registerWithEmail, resetPassword } = useFirebase();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        toast.success('Successfully logged in!');
        onClose();
      } else if (mode === 'register') {
        await registerWithEmail(email, password, name);
        toast.success('Account created successfully!');
        onClose();
      } else {
        await resetPassword(email);
        setMode('login');
      }
    } catch (error: any) {
      // Error handled in context with toast
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await login();
      onClose();
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0a16] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 pb-0 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black font-['Fraunces'] text-white mb-2">
                  {mode === 'login' ? 'Willkommen zurück' : mode === 'register' ? 'Konto erstellen' : 'Passwort vergessen'}
                </h2>
                <p className="text-sm text-[#94a3b8]">
                  {mode === 'login' ? 'Melden Sie sich an, um fortzufahren.' : mode === 'register' ? 'Werden Sie Teil der Creator-Revolution.' : 'Geben Sie Ihre E-Mail ein.'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white/40" />
              </button>
            </div>

            <div className="p-8">
              {/* Social Login */}
              {mode !== 'reset' && (
                <div className="space-y-3 mb-8">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-white/90 transition-all disabled:opacity-50"
                  >
                    <Chrome className="w-5 h-5" />
                    Mit Google fortfahren
                  </button>
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">oder</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-[#00d4ff] outline-none transition-all"
                        placeholder="Max Müller"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-[#00d4ff] outline-none transition-all"
                      placeholder="name@beispiel.de"
                      required
                    />
                  </div>
                </div>

                {mode !== 'reset' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Passwort</label>
                      {mode === 'login' && (
                        <button 
                          type="button"
                          onClick={() => setMode('reset')}
                          className="text-[10px] font-bold text-[#00d4ff] hover:underline"
                        >
                          Vergessen?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-[#00d4ff] outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-[#00d4ff] text-[#060612] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Verarbeitung...' : (
                    <>
                      {mode === 'login' ? 'Anmelden' : mode === 'register' ? 'Registrieren' : 'Link senden'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-xs text-[#475569]">
                  {mode === 'login' ? (
                    <>
                      Noch kein Konto?{' '}
                      <button onClick={() => setMode('register')} className="text-[#00d4ff] font-bold hover:underline">
                        Jetzt registrieren
                      </button>
                    </>
                  ) : (
                    <>
                      Bereits ein Konto?{' '}
                      <button onClick={() => setMode('login')} className="text-[#00d4ff] font-bold hover:underline">
                        Hier anmelden
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
