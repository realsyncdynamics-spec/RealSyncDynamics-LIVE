import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Shield, ShieldAlert, ArrowRight } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useTranslation } from '../contexts/TranslationContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback, adminOnly }) => {
  const { user, loading, setIsLoginModalOpen } = useFirebase();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full"
        />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 animate-pulse">
          {t('common.loading') || 'Verifying Identity...'}
        </p>
      </div>
    );
  }

  if (!user || (adminOnly && user.email !== 'realsyncdynamics@gmail.com')) {
    if (fallback) return <>{fallback}</>;

    const isRestrictedAdmin = adminOnly && user && user.email !== 'realsyncdynamics@gmail.com';

    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-[#00d4ff]/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(0,212,255,0.1)]"
        >
          <ShieldAlert className="w-10 h-10 text-[#00d4ff]" />
        </motion.div>
        
        <h2 className="text-3xl md:text-4xl font-black font-['Fraunces'] tracking-tight mb-4 text-white">
          {isRestrictedAdmin ? 'Admin Access Only' : (t('auth.required.title') || 'Access Restricted')}
        </h2>
        
        <p className="text-[#94a3b8] text-sm md:text-base max-w-md mb-10 leading-relaxed">
          {isRestrictedAdmin 
            ? 'This area is reserved for system administrators. Your account does not have the required permissions.'
            : (t('auth.required.desc') || 'This area is reserved for verified creators and partners. Please sign in with your Google account to continue.')}
        </p>

        {!user ? (
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] group"
            >
              <LogIn className="w-5 h-5" />
              {t('common.login') || 'Sign In'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : isRestrictedAdmin ? (
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-4 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
          >
            Return to Home
          </button>
        ) : null}

        <div className="mt-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
          <Shield className="w-3 h-3" />
          <span>Secure Authentication by Firebase</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
